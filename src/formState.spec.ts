import { observable, runInAction, isObservable } from 'mobx'
import FieldState from './fieldState'
import FormState from './formState'
import { ValidateResultWithError, ValidateResultWithValue } from './types'

const defaultDelay = 10
const stableDelay = defaultDelay * 3 // [onChange debounce] + [async validate] + [buffer]

async function delay(millisecond: number = stableDelay) {
  await new Promise(resolve => setTimeout(() => resolve(), millisecond))
}

async function delayValue<T>(value: T, millisecond: number = defaultDelay) {
  await delay(millisecond)
  return value
}

function createFieldState<T>(initialValue: T) {
  return new FieldState(initialValue, defaultDelay)
}

describe('FormState (mode: object)', () => {
  it('should initialize well', () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    })

    expect(state.value).toEqual(initialValue)
    expect(isObservable(state.$)).toBe(true)
    expect(state.$.foo).toBeInstanceOf(FieldState)
    expect(state.$.foo.$).toBe(initialValue.foo)
    expect(state.$.bar).toBeInstanceOf(FieldState)
    expect(state.$.bar.$).toBe(initialValue.bar)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should initialize well with observable fields', () => {
    const initialValue = { foo: 123, bar: '456' }
    const fields = observable({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }, undefined, { deep: false })
    const state = new FormState(fields)

    expect(state.value).toEqual(initialValue)
    expect(isObservable(state.$)).toBe(true)

    state.dispose()
  })

  it('should compose fields well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    })

    const value = { foo: 0, bar: '123' }
    state.$.foo.onChange(value.foo)
    state.$.bar.onChange(value.bar)
    await delay()

    expect(state.value).toEqual(value)
    expect(state.$.foo.$).toBe(value.foo)
    expect(state.$.bar.$).toBe(value.bar)
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    })

    state.$.foo.onChange(0)
    state.$.bar.onChange('123')
    await delay()
    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.$.foo.$).toBe(initialValue.foo)
    expect(state.$.bar.$).toBe(initialValue.bar)
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('FormState (mode: object) validation', () => {
  it('should work well when initialized', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with fields onChange()', async () => {
    const initialValue = { foo: '', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    state.$.foo.onChange('123')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('same')
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with validate()', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    const validateRet1 = state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('same')
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    const validateResult1 = await validateRet1
    expect(validateResult1.hasError).toBe(true)
    expect((validateResult1 as ValidateResultWithError).error).toBe('same')

    state.$.bar.onChange('456')
    const validateRet2 = state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    const validateResult2 = await validateRet2
    expect(validateResult2.hasError).toBe(false)
    expect((validateResult2 as ValidateResultWithValue<typeof initialValue>).value).toEqual({
      foo: '123',
      bar: '456'
    })

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')
    state.validate()
    await delay()

    state.reset()
    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with multiple validators', async () => {
    const initialValue = { foo: '', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
      ({ foo }) => foo === '' && 'empty'
    )
    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.foo.onChange('456')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.$.bar.onChange('123')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => delayValue(foo === bar && 'same')
    )
    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => delayValue(foo === bar && 'same'),
      ({ foo }) => foo === '' && 'empty'
    )
    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.$.foo.onChange('')

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.foo.onChange('456')

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const options = observable({ checkSame: true })
    const initialValue = { foo: '', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => options.checkSame && foo === bar && 'same',
    )

    state.$.foo.onChange('123')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    runInAction(() => options.checkSame = false)
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.checkSame = true)
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.$.bar.onChange('456')
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const initialValue = { foo: '123', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
    )
    state.$.foo.onChange('')

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.validators(({ foo }) => foo === '' && 'empty')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with fields\' validating', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = { foo: '', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo).validators(notEmpty),
      bar: createFieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
    )
    state.validate()

    await delay()
    expect(state.$.foo.error).toBe('empty')
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$.foo.onChange('123')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBe('same')
    expect(state.error).toBe('same')

    state.$.bar.onChange('')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBe('empty')
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$.bar.onChange('123')
    state.$.foo.onChange('456')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123456')
    state.$.foo.onChange('123456')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBe('same')
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with fields\' async validating', async () => {
    const notEmpty = (value: string) => delayValue(value === '' && 'empty')
    const initialValue = { foo: '', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo).validators(notEmpty),
      bar: createFieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => delayValue(foo === bar && 'same'),
    )
    state.validate()

    await delay()
    expect(state.$.foo.error).toBe('empty')
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$.foo.onChange('123')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBe('same')
    expect(state.error).toBe('same')

    state.$.bar.onChange('')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBe('empty')
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$.bar.onChange('123')
    state.$.foo.onChange('456')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123456')
    state.$.foo.onChange('123456')
    await delay()
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.ownError).toBe('same')
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const options = observable({ disabled: false })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo).validators(notEmpty),
      bar: createFieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
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
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.foo.onChange('')
    await state.validate()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.disabled = false)

    await delay()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.foo.onChange('123')
    await state.validate()
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('same')
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.dispose()
  })
})

describe('FormState (mode: array)', () => {
  it('should initialize well', () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    ))

    expect(state.value).toEqual(initialValue)
    expect(state.$).toHaveLength(initialValue.length)
    state.$.forEach((field, i) => {
      expect(field).toBeInstanceOf(FieldState)
      expect(field.$).toBe(initialValue[i])
    })
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should compose fields well', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    ))

    const value = ['456', '789']
    state.$.forEach((field, i) => field.onChange(value[i]))
    await delay()

    expect(state.value).toEqual(value)
    state.$.forEach((field, i) => {
      expect(field.$).toBe(value[i])
    })
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    ))

    const value = ['456', '789']
    state.$.forEach((field, i) => field.onChange(value[i]))
    await delay()
    state.reset()

    expect(state.value).toEqual(initialValue)
    state.$.forEach((field, i) => {
      expect(field.$).toBe(initialValue[i])
    })
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should applyValidation correctly', async () => {
    const state = new FormState([]).validators(
      value => value.length <= 0 && 'empty'
    )

    let validation: any
    runInAction(() => {
      validation = state.validate()
      state.$ = []
    })

    await delay()
    expect(state.validated).toBe(true)

    state.dispose()
  })
})

describe('FormState (mode: array) validation', () => {
  it('should work well when initialized', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with fields onChange()', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    state.$[1].onChange('456')

    await delay()
    expect(state.$[1].validated).toBe(true)
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('too long')
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with validate()', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('too long')
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields change', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    runInAction(() => {
      state.$.push(createFieldState('456'))
    })
    // 如果不手动调用 validate()，新增 field 可能一直处于初始状态，即 !dirty，从而导致 !form.validated
    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    runInAction(() => {
      state.$.splice(0, 1)
    })

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')
    state.validate()
    await delay()

    state.reset()
    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with multiple validators', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => list.join('').length > 5 && 'too long',
      list => list.length >= 3 && 'too many'
    )
    state.validate()

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$[1].onChange('456')

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    runInAction(() => {
      state.$.splice(
        1, 1,
        createFieldState(''),
        createFieldState('')
      )
    })

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => delayValue(list.join('').length > 5 && 'too long')
    )
    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => delayValue(list.join('').length > 5 && 'too long'),
      list => list.length >= 3 && 'too many'
    )
    state.validate()

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$[1].onChange('456')

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$[0].onChange('')
    runInAction(() => {
      state.$.push(createFieldState(''))
    })
    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const options = observable({ checkLength: true })
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => options.checkLength && list.join('').length > 5 && 'too long',
    )

    state.validate()
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    runInAction(() => options.checkLength = false)
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.checkLength = true)
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$[1].onChange('')
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const initialValue = ['123', '', '4']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    )
    state.validate()

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.validators(list => list.length >= 3 && 'too many')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    runInAction(() => {
      state.$.pop()
    })
    state.$[1].onChange('456')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields\' validating', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    )
    state.validate()

    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBe('empty')
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$[1].onChange('456')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBe('too long')
    expect(state.error).toBe('too long')

    state.$[0].onChange('1')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('123')
    state.$[1].onChange('4')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('1234')
    state.$[1].onChange('56')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBe('too long')
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields\' async validating', async () => {
    const notEmpty = (value: string) => delayValue(value === '' && 'empty')
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => delayValue(list.join('').length > 5 && 'too long')
    )
    state.validate()

    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBe('empty')
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$[1].onChange('456')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBe('too long')
    expect(state.error).toBe('too long')

    state.$[0].onChange('1')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('123')
    state.$[1].onChange('4')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('1234')
    state.$[1].onChange('56')
    await delay()
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.ownError).toBe('too long')
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const options = observable({ disabled: false })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(
      () => options.disabled
    )

    runInAction(() => options.disabled = true)

    await state.validate()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$[0].onChange('')
    await state.validate()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.disabled = false)
    await delay()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$[0].onChange('123')
    await delay()
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('too long')
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should give correct `validated` value with validation-disabled field', async () => {
    const options = observable({ disabled: true })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '456']
    const disabledState = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(
      () => options.disabled
    )
    const state = new FormState({
      foo: new FieldState(''),
      disabled: disabledState
    })

    state.validate()
    await delay()

    expect(state.$.disabled.validated).toBe(false)
    expect(state.validated).toBe(true)
  })
})

describe('nested FormState', () => {
  it('should work well', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'

    const enabledState = createFieldState(true)

    const shouldDisableInputsState = () => !enabledState.$

    const inputsState = new FormState<FieldState<string>[]>([]).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(shouldDisableInputsState)

    const state = new FormState({
      inputs: inputsState,
      enabled: enabledState
    })

    const createInputDuplicateValidator = (currentInputState: FieldState<string>) => (value: string) => {
      for (const inputState of state.$.inputs.$) {
        if (inputState !== currentInputState && value === inputState.$) {
          return 'duplicated'
        }
      }
    }

    const createInputState = (initialValue: string) => {
      const inputState = createFieldState(initialValue).validators(notEmpty)
      const duplicateValidator = createInputDuplicateValidator(inputState)
      return inputState.validators(duplicateValidator)
    }

    runInAction(() => {
      state.$.inputs.$.push(
        createInputState(''),
        createInputState('')
      )
    })

    await state.validate()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')
    expect(state.$.inputs.ownError).toBeUndefined()
    expect(state.$.inputs.$[0].error).toBe('empty')
    expect(state.$.inputs.$[1].error).toBe('empty')

    state.$.inputs.$[0].onChange('123')
    state.$.inputs.$[1].onChange('456')

    await state.validate()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('too long')
    expect(state.$.inputs.error).toBe('too long')
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBeUndefined()

    state.$.enabled.onChange(false)

    await delay()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.enabled.onChange(true)
    state.$.inputs.$[1].onChange('')

    await delay()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('empty')
    expect(state.$.inputs.ownError).toBeUndefined()
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBe('empty')

    state.$.inputs.$[1].onChange('4')
    runInAction(() => {
      state.$.inputs.$.push(createFieldState('56'))
    })

    await delay()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('too long')
    expect(state.$.inputs.error).toBe('too long')
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBeUndefined()
    expect(state.$.inputs.$[2].error).toBeUndefined()
  })
})
