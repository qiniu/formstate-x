import { when, observable, runInAction } from 'mobx'
import { DebouncedState, DebouncedFieldState } from './debouncedState'
import { ValidateResultWithError, ValidateResultWithValue, ValidateStatus } from './types'
import { defaultDelay, delay, delayValue } from './testUtils'
import { FieldState } from './fieldState'
import { ArrayFormState, FormState } from './formState'

describe('DebouncedState', () => {
  it('should initialize well', async () => {
    const state = new DebouncedState(new FieldState(''))
    expect(state.value).toBe('')
  })

  it('should initialize well with FieldState', async () => {
    const initialValue = '123'
    const state = new DebouncedState(new FieldState(initialValue), defaultDelay)

    expect(state.$.value).toBe(initialValue)
    expect(state.value).toBe(initialValue)

    const newValue = ''
    state.onChange(newValue)
    expect(state.value).toBe(initialValue)
    expect(state.$.value).toBe(newValue)

    await delay()
    expect(state.value).toBe(newValue)
    expect(state.$.value).toBe(newValue)
  })

  it('should initialize well with FormState', async () => {
    const initialValue = {
      foo: 123,
      bar: 456
    }
    const state = new DebouncedState(new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    }), defaultDelay)

    expect(state.$.value).toEqual(initialValue)
    expect(state.value).toEqual(initialValue)

    const newValue = {
      foo: 456,
      bar: 789
    }
    state.onChange(newValue)
    expect(state.value).toEqual(initialValue)
    expect(state.$.value).toEqual(newValue)

    await delay()
    expect(state.value).toEqual(newValue)
    expect(state.$.value).toEqual(newValue)
  })

  it('should initialize well with ArrayFormState', async () => {
    const initialValue = ['a', 'b']
    const state = new DebouncedState(new ArrayFormState(
      initialValue,
      v => new FieldState(v)
    ), defaultDelay)

    expect(state.$.value).toEqual(initialValue)
    expect(state.value).toEqual(initialValue)

    const newValue = ['c', 'd', 'e']
    state.onChange(newValue)
    expect(state.value).toEqual(initialValue)
    expect(state.$.value).toEqual(newValue)

    await delay()
    expect(state.value).toEqual(newValue)
    expect(state.$.value).toEqual(newValue)
  })

  it('should dispose well', () => {
    new DebouncedState(new FieldState('')).dispose()
  })
})

function createFieldState<T>(initialValue: T, delay = defaultDelay) {
  return new DebouncedFieldState(initialValue, delay)
}

describe('DebouncedFieldState', () => {
  it('should initialize well', () => {
    const initialValue = '123'
    const state = new DebouncedFieldState(initialValue, defaultDelay)

    expect(state.$.value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)
  })

  it('should initialize well with default delay as 200ms', async () => {
    const initialValue = '123'
    const state = new DebouncedFieldState(initialValue)

    expect(state.$.value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    const newValue = 'abc'
    state.onChange(newValue)
    await delay(100)

    expect(state.$.value).toBe(newValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    await delay(100)

    expect(state.$.value).toBe(newValue)
    expect(state.value).toBe(newValue)
    expect(state.dirty).toBe(true)
  })

  it('should onChange well', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue).withValidator(
      value => value.length > 5 && 'too long'
    )

    const value = '123'
    state.$.onChange(value)
    expect(state.$.value).toBe(value)
    expect(state.value).toBe(initialValue)
    expect(state.activated).toBe(false)
    expect(state.validateStatus).toBe(ValidateStatus.NotValidated)
    expect(state.dirty).toBe(false)

    await delay()
    expect(state.$.value).toBe(value)
    expect(state.value).toBe(value)
    expect(state.activated).toBe(true)
    expect(state.validateStatus).toBe(ValidateStatus.Validated)
    expect(state.dirty).toBe(true)

    const newValue = '789'
    state.$.onChange('456')
    state.$.onChange(newValue)
    expect(state.$.value).toBe(newValue)
    expect(state.value).toBe(value)

    await delay()
    expect(state.$.value).toBe(newValue)
    expect(state.value).toBe(newValue)
    expect(state.dirty).toBe(true)

    const invalidValue = '123456'
    state.$.onChange(invalidValue)
    expect(state.$.value).toBe(invalidValue)
    expect(state.value).toBe(newValue)

    await delay()
    expect(state.$.value).toBe(invalidValue)
    expect(state.value).toBe(invalidValue)
  })

  it('should set well', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue)

    const value = '123'
    state.set(value)
    expect(state.$.value).toBe(value)
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
    expect(state.$.value).toBe(value)
    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)
  })

  it('should reset well', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue)

    state.$.onChange('123')
    await delay()
    state.reset()

    expect(state.$.value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.$.onChange('456')
    state.reset()

    expect(state.$.value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)
  })

  it('should work well with delay', async () => {
    const state = createFieldState('0', 1000)

    state.$.onChange('1')
    expect(state.value).toBe('0')
    await delay(250)
    expect(state.value).toBe('0')

    state.$.onChange('2')
    expect(state.value).toBe('0')
    await delay(500)
    expect(state.value).toBe('0')

    state.$.onChange('3')
    expect(state.value).toBe('0')
    await delay(750)
    expect(state.value).toBe('0')

    state.$.onChange('4')
    expect(state.value).toBe('0')
    await delay(1250)
    expect(state.value).toBe('4')

  })

  it('should dispose well', () => {
    new DebouncedFieldState('').dispose()
  })
})

describe('DebouncedFieldState validation', () => {
  it('should work well when initialized', async () => {
    const state = createFieldState('').withValidator(val => !val && 'empty')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well with onChange()', async () => {
    const state = createFieldState('xxx').withValidator(val => !val && 'empty')
    state.$.onChange('')

    expect(state.validateStatus).toBe(ValidateStatus.NotValidated)
    expect(state.hasError).toBe(false)

    await delay()
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)

    state.$.onChange('123')
    state.$.onChange('123456')
    state.$.onChange('')

    await delay()
    expect(state.error).toBe('empty')
  })

  it('should work well with onChange of same value', async () => {
    const state = createFieldState(1).withValidator(
      () => null
    )
    await state.validate()
    expect(state.validated).toBe(true)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)

    state.$.onChange(1)
    await delay()
    expect(state.validated).toBe(true)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
  })

  it('should work well with validate()', async () => {
    const validator = jest.fn(val => {
      return !val && 'empty'
    })
    const state = createFieldState('').withValidator(validator)
    const validateRet1 = state.validate()

    expect(validator).toBeCalled()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    const validateResult1 = await validateRet1
    expect(validateResult1.hasError).toBe(true)
    expect((validateResult1 as ValidateResultWithError).error).toBe('empty')

    state.$.onChange('sth')
    const validateRet2 = state.validate()
    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    const validateResult2 = await validateRet2
    expect(validateResult2.hasError).toBe(false)
    expect((validateResult2 as ValidateResultWithValue<string>).value).toBe('sth')
  })

  it('should work well with reset()', async () => {
    const initialValue = ''
    const state = createFieldState(initialValue).withValidator(val => !val && 'empty')
    state.validate()
    await delay()

    state.reset()
    expect(state.$.value).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well with multiple validators', async () => {
    const state = createFieldState('').withValidator(
      val => !val && 'empty',
      val => val.length > 5 && 'too long'
    )
    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.onChange('123456')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$.onChange('123')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well with dynamic validator', async () => {
    const target = observable({ value: '123' })
    const state = createFieldState('').withValidator(
      val => val === target.value && 'same'
    )

    state.$.onChange('123')
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

    state.$.onChange('123456')
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well when add validator dynamically', async () => {
    const state = createFieldState('').withValidator(
      val => !val && 'empty'
    )
    state.$.onChange('123456')

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.withValidator(val => val.length > 5 && 'too long')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')
  })

  it('should work well with disableWhen', async () => {
    const initialValue = ''
    const options = observable({ disabled: false })
    const state = createFieldState(initialValue).withValidator(
      val => !val && 'empty'
    ).disableWhen(
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

    state.$.onChange('123')
    await delay()
    state.$.onChange('')
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
  })

  it('should work well with race condition caused by validate()', async () => {
    const validator = jest.fn()
    validator.mockReturnValueOnce(delayValue('foo', 200))
    validator.mockReturnValueOnce(delayValue('bar', 100))
    const field = createFieldState(1).withValidator(validator)
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
    const field = createFieldState(1).withValidator(validator)
    field.$.onChange(2)
    await delay(50)
    field.$.onChange(3)
    await when(() => field.validated)

    expect(field.error).toBe('bar')
  })

  it('should work well with NaN', async () => {
    const state = createFieldState(Number.NaN).withValidator(
      () => 'error'
    )
    state.validate()
    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.error).toBe('error')
  })

  it('should validate with no delay', () => {
    const validator = jest.fn(() => 'foo')
    const state = createFieldState('0').withValidator(validator)
    state.validate()
    expect(validator).toBeCalled()
  })

  it('should auto validate with delay', async () => {
    const validator = jest.fn(() => 'foo')
    const state = createFieldState(0, 500).withValidator(validator)
    state.onChange(1)

    expect(validator).not.toBeCalled()
    expect(state.validateStatus).toBe(ValidateStatus.NotValidated)

    await delay(250)
    expect(validator).not.toBeCalled()
    expect(state.validateStatus).toBe(ValidateStatus.NotValidated)

    await delay(500)
    expect(validator).toBeCalled()
    expect(state.validateStatus).toBe(ValidateStatus.Validated)
  })
})
