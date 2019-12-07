import { when, spy, observable, runInAction } from 'mobx'
import FieldState from './fieldState'

// spy((event) => {
//   if (event.type === 'action') {
//     console.log(`${event.name} with args: ${event.arguments}`)
//   }
// })

const defaultDelay = 10

function delay<T>(value?: T, delay: number = defaultDelay + 10): Promise<T> {
  return new Promise(
    resolve => setTimeout(() => resolve(value), delay)
  )
}

function createFieldState<T>(initialValue: T) {
  return new FieldState(initialValue, defaultDelay)
}

describe('FieldState', () => {
  it('should initialize well', () => {
    const initialValue = '123'
    const state = createFieldState(initialValue)

    expect(state._value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.$).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should onChange well', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue).validators(
      value => value.length > 5 && 'too long'
    )

    const value = '123'
    state.onChange(value)
    expect(state._value).toBe(value)
    expect(state.value).toBe(initialValue)
    expect(state.$).toBe(initialValue)

    await when(() => state.validated)
    expect(state._value).toBe(value)
    expect(state.value).toBe(value)
    expect(state.$).toBe(value)
    expect(state.dirty).toBe(true)

    const newValue = '789'
    state.onChange('456')
    state.onChange(newValue)
    expect(state._value).toBe(newValue)
    expect(state.value).toBe(value)
    expect(state.$).toBe(value)

    await when(() => state.validated)
    expect(state._value).toBe(newValue)
    expect(state.value).toBe(newValue)
    expect(state.$).toBe(newValue)
    expect(state.dirty).toBe(true)

    const invalidValue = '123456'
    state.onChange(invalidValue)
    expect(state._value).toBe(invalidValue)
    expect(state.value).toBe(newValue)
    expect(state.$).toBe(newValue)

    await delay()
    expect(state._value).toBe(invalidValue)
    expect(state.value).toBe(invalidValue)
    expect(state.$).toBe(newValue)

    await delay()
    expect(state.$).toBe(newValue)

    state.dispose()
  })

  it('should set well', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue)

    const value = '123'
    state.set(value)
    expect(state._value).toBe(value)
    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)

    state.validate()
    await when(() => state.validated)
    expect(state._value).toBe(value)
    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue)

    state.onChange('123')
    await when(() => state.validated)
    state.reset()

    expect(state._value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.onChange('456')
    state.reset()

    expect(state._value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('FieldState validation', () => {
  it('should work well when initialized', async () => {
    const state = createFieldState('').validators(val => !val && 'empty')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with onChange()', async () => {
    const state = createFieldState('xxx').validators(val => !val && 'empty')
    state.onChange('')

    await when(() => state.validating)
    expect(state.validating).toBe(true)
    expect(state.validated).toBe(false)

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.onChange('123')
    state.onChange('123456')
    state.onChange('')

    await delay()
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with onChange of same value', async () => {
    const state = createFieldState(1).validators(
      () => null
    )
    await state.validate()
    expect(state.validated).toBe(true)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)

    state.onChange(1)
    await delay()
    expect(state.validated).toBe(true)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
  })

  it('should work well with validate()', async () => {
    const state = createFieldState('').validators(val => !val && 'empty')
    state.validate()

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue).validators(val => !val && 'empty')
    state.validate()
    await when(() => state.validated)

    state.reset()
    expect(state._value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with multiple validators', async () => {
    const state = createFieldState('').validators(
      val => !val && 'empty',
      val => val.length > 5 && 'too long'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.onChange('123456')

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.onChange('123')

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const state = createFieldState('').validators(
      val => !val && delay('empty')
    )
    state.validate()

    await when(() => state.validating)
    expect(state.validating).toBe(true)
    expect(state.validated).toBe(false)

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const state = createFieldState('').validators(
      val => !val && delay('empty'),
      val => val.length > 5 && 'too long'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.onChange('123456')

    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.onChange('123')

    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const target = observable({ value: '123' })
    const state = createFieldState('').validators(
      val => val === target.value && 'same'
    )

    state.onChange('123')
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    runInAction(() => target.value = '123456')
    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => target.value = '123')
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.onChange('123456')
    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const state = createFieldState('').validators(
      val => !val && 'empty'
    )
    state.onChange('123456')

    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.validators(val => val.length > 5 && 'too long')
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const initialValue = ''
    const options = observable({ disabled: false })
    const state = createFieldState(initialValue).validators(
      val => !val && 'empty'
    ).disableValidationWhen(
      () => options.disabled
    )

    runInAction(() => options.disabled = true)

    const validated = state.validate()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)

    await validated
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.onChange('123')
    await delay()
    state.onChange('')
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.disabled = false)
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })
})
