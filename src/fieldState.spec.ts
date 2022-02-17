import { when, observable, runInAction } from 'mobx'
import { FieldState } from './fieldState'
import { ValidateResultWithError, ValidateResultWithValue } from './types'
import { delay, delayValue, assertType } from './testUtils'

describe('FieldState', () => {
  it('should initialize well', () => {
    const initialValue = '123'
    const state = new FieldState(initialValue)

    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should onChange well', async () => {
    const initialValue = ''
    const state = new FieldState(initialValue).addValidator(
      value => value.length > 5 && 'too long'
    )

    const value = '123'
    state.onChange(value)

    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)

    const newValue = '789'
    state.onChange('456')
    state.onChange(newValue)
    expect(state.value).toBe(newValue)
    expect(state.dirty).toBe(true)

    const invalidValue = '123456'
    state.onChange(invalidValue)
    expect(state.value).toBe(invalidValue)

    state.dispose()
  })

  it('should set well', async () => {
    const initialValue = ''
    const state = new FieldState(initialValue)

    const value = '123'
    state.set(value)
    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)

    // set 不应该使 field 激活
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)

    state.validate()
    await delay()
    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = ''
    const state = new FieldState(initialValue)

    state.onChange('123')
    await delay()
    state.reset()

    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.onChange('456')
    state.reset()

    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('FieldState validation', () => {
  it('should work well when initialized', async () => {
    const state = new FieldState('').addValidator(val => !val && 'empty')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with onChange()', async () => {
    const state = new FieldState('xxx').addValidator(val => !val && 'empty')
    state.onChange('')

    await delay()
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)

    state.onChange('123')
    state.onChange('123456')
    state.onChange('')

    await delay()
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with onChange of same value', async () => {
    const state = new FieldState(1).addValidator(
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
    const state = new FieldState('').addValidator(val => !val && 'empty')
    const validateRet1 = state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    const validateResult1 = await validateRet1
    expect(validateResult1.hasError).toBe(true)
    expect((validateResult1 as ValidateResultWithError).error).toBe('empty')

    state.onChange('sth')
    const validateRet2 = state.validate()
    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    const validateResult2 = await validateRet2
    expect(validateResult2.hasError).toBe(false)
    expect((validateResult2 as ValidateResultWithValue<string>).value).toBe('sth')

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = ''
    const state = new FieldState(initialValue).addValidator(val => !val && 'empty')
    state.validate()
    await delay()

    state.reset()
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with multiple validators', async () => {
    const state = new FieldState('').addValidator(
      val => !val && 'empty',
      val => val.length > 5 && 'too long'
    )
    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.onChange('123456')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.onChange('123')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const state = new FieldState('').addValidator(
      val => delayValue(!val && 'empty')
    )
    state.validate()

    await when(() => state.validating)
    expect(state.validating).toBe(true)
    expect(state.validated).toBe(false)

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const state = new FieldState('').addValidator(
      val => delayValue(!val && 'empty'),
      val => val.length > 5 && 'too long'
    )
    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.onChange('123456')

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.onChange('123')

    await delay()
    expect(state.error).toBeUndefined()
    expect(state.hasError).toBe(false)

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const target = observable({ value: '123' })
    const state = new FieldState('').addValidator(
      val => val === target.value && 'same'
    )

    state.onChange('123')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    runInAction(() => target.value = '123456')
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => target.value = '123')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.onChange('123456')
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const state = new FieldState('').addValidator(
      val => !val && 'empty'
    )
    state.onChange('123456')

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.addValidator(val => val.length > 5 && 'too long')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with disableValidationWhen()', async () => {
    const initialValue = ''
    const options = observable({ disabled: false })
    const state = new FieldState(initialValue).addValidator(
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

  it('should work well with race condition caused by validate()', async () => {
    const validator = jest.fn()
    validator.mockReturnValueOnce(delayValue('foo', 200))
    validator.mockReturnValueOnce(delayValue('bar', 100))
    const field = new FieldState(1).addValidator(validator)
    field.validate()
    await delay(50)
    await field.validate()

    expect(field.error).toBe('bar')
  })

  it('should work well with race condition caused by value change', async () => {
    const validator = jest.fn()
    validator.mockReturnValue(null)
    validator.mockReturnValueOnce(delayValue('foo', 200))
    validator.mockReturnValueOnce(delayValue('bar', 100))
    const field = new FieldState(1).addValidator(validator)
    field.onChange(2)
    await delay(50)
    field.onChange(3)
    await when(() => field.validated)

    expect(field.error).toBe('bar')
  })

  it('should work well with NaN', async () => {
    const state = new FieldState(Number.NaN).addValidator(
      () => 'error'
    )
    state.validate()
    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.error).toBe('error')
  })

  it('should provide type-safe result when validate()', async () => {
    const state = new FieldState('')
    const res = await state.validate()
    if (res.hasError) {
      assertType<true>(res.hasError)
      assertType<string>(res.error)
    } else {
      assertType<false>(res.hasError)
      assertType<string>(res.value)
    }
  })
})
