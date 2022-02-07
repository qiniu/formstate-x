import { observable, isObservable } from 'mobx'
import FieldState from './fieldState'
import { FormState, ArrayFormState, isFormState } from './formState'
import { Error, IState, ValidateResultWithError, ValidateResultWithValue } from './types'
import { delay, delayValue, assertType } from './testUtils'

describe('FormState (mode: object)', () => {
  it('should initialize well', () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    })

    expect(state.value).toEqual(initialValue)
    expect(isObservable(state.$)).toBe(true)
    expect(state.$.foo).toBeInstanceOf(FieldState)
    expect(state.$.bar).toBeInstanceOf(FieldState)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should initialize well with observable fields', () => {
    const initialValue = { foo: 123, bar: '456' }
    const fields = observable({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    }, undefined, { deep: false })
    const state = new FormState(fields)

    expect(state.value).toEqual(initialValue)
    expect(isObservable(state.$)).toBe(true)

    state.dispose()
  })

  it('should compose fields well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    })

    const value = { foo: 0, bar: '123' }
    state.$.foo.onChange(value.foo)
    state.$.bar.onChange(value.bar)
    await delay()

    expect(state.value).toEqual(value)
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should set well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    })

    const value1 = { foo: 0, bar: '' }
    state.set(value1)
    expect(state.value).toEqual(value1)
    expect(state.$.foo.value).toBe(value1.foo)
    expect(state.$.bar.value).toBe(value1.bar)
    expect(state.dirty).toBe(true)

    state.reset()

    const value2 = { foo: 123, bar: '' }
    state.set(value2)
    expect(state.value).toEqual(value2)
    expect(state.$.foo.value).toBe(value2.foo)
    expect(state.$.bar.value).toBe(value2.bar)
    expect(state.dirty).toBe(true)

    state.reset()

    const value3 = { foo: 0, bar: '456' }
    state.set(value3)
    expect(state.value).toEqual(value3)
    expect(state.$.foo.value).toBe(value3.foo)
    expect(state.$.bar.value).toBe(value3.bar)
    expect(state.dirty).toBe(true)

    state.reset()

    state.set(initialValue)
    expect(state.value).toEqual(initialValue)
    expect(state.$.foo.value).toBe(initialValue.foo)
    expect(state.$.bar.value).toBe(initialValue.bar)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should onChange well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    })

    const value1 = { foo: 0, bar: '' }
    state.onChange(value1)
    await delay()
    expect(state.value).toEqual(value1)
    expect(state.$.foo.value).toBe(value1.foo)
    expect(state.$.bar.value).toBe(value1.bar)
    expect(state.dirty).toBe(true)

    state.reset()

    const value2 = { foo: 123, bar: '' }
    state.onChange(value2)
    await delay()
    expect(state.value).toEqual(value2)
    expect(state.$.foo.value).toBe(value2.foo)
    expect(state.$.bar.value).toBe(value2.bar)
    expect(state.dirty).toBe(true)

    state.reset()

    const value3 = { foo: 0, bar: '456' }
    state.onChange(value3)
    await delay()
    expect(state.value).toEqual(value3)
    expect(state.$.foo.value).toBe(value3.foo)
    expect(state.$.bar.value).toBe(value3.bar)
    expect(state.dirty).toBe(true)

    state.reset()

    state.onChange(initialValue)
    await delay()
    expect(state.value).toEqual(initialValue)
    expect(state.$.foo.value).toBe(initialValue.foo)
    expect(state.$.bar.value).toBe(initialValue.bar)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    })

    state.$.foo.onChange(0)
    state.$.bar.onChange('123')
    await delay()
    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('FormState (mode: object) validation', () => {
  it('should work well when initialized', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  describe('should work well with onChange()', () => {

    it('and form validator', async () => {
      const initialValue = { foo: '', bar: '123' }
      const state = new FormState({
        foo: new FieldState(initialValue.foo),
        bar: new FieldState(initialValue.bar)
      }).validators(({ foo, bar }) => foo === bar && 'same')
  
      state.onChange({ foo: '123', bar: '123' })
  
      await delay()
      expect(state.validating).toBe(false)
      expect(state.hasOwnError).toBe(true)
      expect(state.ownError).toBe('same')
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('same')
  
      state.dispose()
    })

    it('and field validator', async () => {
      const initialValue = { foo: '', bar: '123' }
      const state = new FormState({
        foo: new FieldState(initialValue.foo),
        bar: new FieldState(initialValue.bar).validators(v => !v && 'empty')
      })
  
      state.onChange({ foo: '123', bar: '' })
  
      await delay()
      expect(state.validating).toBe(false)
      expect(state.hasOwnError).toBe(false)
      expect(state.ownError).toBeUndefined()
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('empty')
  
      state.dispose()
    })
  })

  it('should work well with fields onChange()', async () => {
    const initialValue = { foo: '', bar: '123' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
    const options = observable({
      checkSame: true,
      updateCheckSame(value: boolean) {
        this.checkSame = value
      }
    })
    const initialValue = { foo: '', bar: '123' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => options.checkSame && foo === bar && 'same',
    )

    state.$.foo.onChange('123')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    options.updateCheckSame(false)
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    options.updateCheckSame(true)
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
      foo: new FieldState(initialValue.foo),
      bar: new FieldState(initialValue.bar)
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
      foo: new FieldState(initialValue.foo).validators(notEmpty),
      bar: new FieldState(initialValue.bar).validators(notEmpty)
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
      foo: new FieldState(initialValue.foo).validators(notEmpty),
      bar: new FieldState(initialValue.bar).validators(notEmpty)
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
    const options = observable({
      disabled: false,
      updateDisabled(value: boolean) {
        this.disabled = value
      }
    })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: new FieldState(initialValue.foo).validators(notEmpty),
      bar: new FieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
    ).disableValidationWhen(
      () => options.disabled
    )

    options.updateDisabled(true)

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

    options.updateDisabled(false)

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

  it('should provide type-safe result when validate()', async () => {
    const state = new FormState({
      foo: new FieldState('')
    })
    const res = await state.validate()
    if (res.hasError) {
      assertType<true>(res.hasError)
      assertType<string>(res.error)
    } else {
      assertType<false>(res.hasError)
      assertType<{ foo: string }>(res.value)
    }
  })
})

describe('FormState (mode: array)', () => {
  it('should initialize well', () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v))

    expect(state.value).toEqual(initialValue)
    expect(state.$).toHaveLength(initialValue.length)
    state.$.forEach(field => {
      expect(field).toBeInstanceOf(FieldState)
    })
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should compose fields well', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v))

    const value = ['456', '789']
    state.$.forEach((field, i) => field.onChange(value[i]))
    await delay()

    expect(state.value).toEqual(value)
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should set well', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      v => v.length > 2 && 'too long'
    )

    const value1 = ['123', '456', '789']
    state.set(value1)
    expect(state.value).toEqual(value1)
    expect(state.$).toHaveLength(value1.length)
    state.$.forEach((field, i) => {
      expect(field.value).toBe(value1[i])
    })
    expect(state.dirty).toBe(true)
    expect(state.hasError).toBe(false)

    state.reset()

    const value2 = ['456', '789', '012']
    state.set(value2)
    expect(state.value).toEqual(value2)
    expect(state.$).toHaveLength(value2.length)
    state.$.forEach((field, i) => {
      expect(field.value).toBe(value2[i])
    })
    expect(state.dirty).toBe(true)
    expect(state.hasError).toBe(false)

    state.reset()

    const field2Dispose = state.$[1].dispose = jest.fn(state.$[1].dispose)
    const value3 = ['abc']
    state.set(value3)
    expect(state.value).toEqual(value3)
    expect(state.$).toHaveLength(value3.length)
    state.$.forEach((field, i) => {
      expect(field.value).toBe(value3[i])
    })
    expect(state.dirty).toBe(true)
    expect(state.hasError).toBe(false)
    expect(field2Dispose).toBeCalled()

    state.reset()

    const field1Dispose = state.$[0].dispose = jest.fn(state.$[0].dispose)
    const value4: string[] = []
    state.set(value4)
    expect(state.value).toEqual(value4)
    expect(state.$).toHaveLength(value4.length)
    expect(state.dirty).toBe(true)
    expect(state.hasError).toBe(false)
    expect(field1Dispose).toBeCalled()

    state.dispose()
  })

  it('should onChange well', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      v => v.length > 2 && 'too long'
    )

    const value1 = ['123', '456', '789']
    state.onChange(value1)
    await delay()
    expect(state.value).toEqual(value1)
    expect(state.$).toHaveLength(value1.length)
    state.$.forEach((field, i) => {
      expect(field.value).toBe(value1[i])
    })
    expect(state.dirty).toBe(true)
    expect(state.hasError).toBe(true)

    state.reset()

    const value2 = ['456', '789', '012']
    state.onChange(value2)
    await delay()
    expect(state.value).toEqual(value2)
    expect(state.$).toHaveLength(value2.length)
    state.$.forEach((field, i) => {
      expect(field.value).toBe(value2[i])
    })
    expect(state.dirty).toBe(true)
    expect(state.hasError).toBe(true)

    state.reset()

    const field2Dispose = state.$[1].dispose = jest.fn(state.$[1].dispose)
    const value3 = ['abc']
    state.onChange(value3)
    await delay()
    expect(state.value).toEqual(value3)
    expect(state.$).toHaveLength(value3.length)
    state.$.forEach((field, i) => {
      expect(field.value).toBe(value3[i])
    })
    expect(state.dirty).toBe(true)
    expect(field2Dispose).toBeCalled()
    expect(state.hasError).toBe(false)

    state.reset()

    const field1Dispose = state.$[0].dispose = jest.fn(state.$[0].dispose)
    const value4: string[] = []
    state.onChange(value4)
    await delay()
    expect(state.value).toEqual(value4)
    expect(state.$).toHaveLength(value4.length)
    expect(state.dirty).toBe(true)
    expect(field1Dispose).toBeCalled()

    state.dispose()
  })

  describe('remove', () => {

    function createState(initialValue: string[]) {
      return new ArrayFormState(initialValue, v => new FieldState(v)).validators(
        v => v.length === 0 && 'empty'
      )
    }

    it('should work well', async () => {
      const state = createState(['123', '456', '789'])

      state.remove(2)
      expect(state.$.length).toBe(2)
      expect(state.value).toEqual(['123', '456'])

      state.remove(1)
      expect(state.$.length).toBe(1)
      expect(state.value).toEqual(['123'])

      state.remove(0)
      expect(state.$.length).toBe(0)
      expect(state.value).toEqual([])
      expect(state.hasError).toBe(true)
    })

    it('should work well with num', async () => {
      const state = createState(['123', '456', '789'])

      state.remove(0, 2)
      expect(state.$.length).toBe(1)
      expect(state.value).toEqual(['789'])

      state.remove(0, 1)
      expect(state.$.length).toBe(0)
      expect(state.value).toEqual([])
      expect(state.hasError).toBe(true)
    })

    it('should work well with negative index', async () => {
      const state = createState(['123', '456', '789'])

      state.remove(-1)
      expect(state.$.length).toBe(2)
      expect(state.value).toEqual(['123', '456'])

      state.remove(-2, 2)
      expect(state.$.length).toBe(0)
      expect(state.value).toEqual([])
      expect(state.hasError).toBe(true)
    })

    it('should do nothing with non-positive num', () => {
      const state = createState(['123', '456'])
      state.remove(0, 0)
      expect(state.value).toEqual(['123', '456'])
      state.remove(0, -1)
      expect(state.value).toEqual(['123', '456'])
    })
  })

  describe('insert', () => {

    function createState(initialValue: string[]) {
      return new ArrayFormState(initialValue, v => new FieldState(v)).validators(
        v => v.length > 2 && 'too long'
      )
    }

    it('should work well', async () => {
      const state = createState([])

      state.insert(0, '123')
      expect(state.$.length).toBe(1)
      expect(state.value).toEqual(['123'])

      state.insert(0, '456')
      expect(state.$.length).toBe(2)
      expect(state.value).toEqual(['456', '123'])

      state.insert(1, '789')
      expect(state.$.length).toBe(3)
      expect(state.value).toEqual(['456', '789', '123'])
      expect(state.hasError).toBe(true)
    })

    it('should work well with more field values', async () => {
      const state = createState(['123'])

      state.insert(0, '456', '789')
      expect(state.$.length).toBe(3)
      expect(state.value).toEqual(['456', '789', '123'])
      expect(state.hasError).toBe(true)
    })

    it('should work well with negative index', async () => {
      const state = createState(['123'])

      state.insert(-1, '456')
      expect(state.$.length).toBe(2)
      expect(state.value).toEqual(['456', '123'])

      state.insert(-1, '789', '012')
      expect(state.$.length).toBe(4)
      expect(state.value).toEqual(['456', '789', '012', '123'])
      expect(state.hasError).toBe(true)
    })
  })

  describe('append', () => {

    function createState(initialValue: string[]) {
      return new ArrayFormState(initialValue, v => new FieldState(v)).validators(
        v => v.length > 2 && 'too long'
      )
    }

    it('should work well', async () => {
      const state = createState(['123'])

      state.append('456')
      expect(state.$.length).toBe(2)
      expect(state.value).toEqual(['123', '456'])

      state.append('789', '012')
      expect(state.$.length).toBe(4)
      expect(state.value).toEqual(['123', '456', '789', '012'])
      expect(state.hasError).toBe(true)
    })
  })

  describe('move', () => {

    function createState(initialValue: string[]) {
      return new ArrayFormState(initialValue, v => new FieldState(v)).validators(
        v => v.length > 2 && 'too long'
      )
    }

    it('should work well', async () => {
      const state = createState(['123', '456', '789'])

      state.move(1, 2)
      expect(state.value).toEqual(['123', '789', '456'])

      state.move(0, 2)
      expect(state.value).toEqual(['789', '456', '123'])

      state.move(1, 0)
      expect(state.value).toEqual(['456', '789', '123'])
    })

    it('should work well with negative index', async () => {
      const state = createState(['a', 'b', 'c', 'd'])

      state.move(-1, 0)
      expect(state.value).toEqual(['d', 'a', 'b', 'c'])

      state.move(1, -1)
      expect(state.value).toEqual(['d', 'b', 'c', 'a'])

      state.move(0, 2)
      expect(state.value).toEqual(['b', 'c', 'd', 'a'])

      state.move(-2, -1)
      expect(state.value).toEqual(['b', 'c', 'a', 'd'])

      state.move(3, 1)
      expect(state.value).toEqual(['b', 'd', 'c', 'a'])
    })

    it('should activate state', () => {
      const state = createState(['a', 'b', 'c', 'd'])
      expect(state.hasError).toBe(false)

      state.move(1, 0)
      expect(state.value).toEqual(['b', 'a', 'c', 'd'])
      expect(state.hasError).toBe(true)
    })

    it('should do nothing with the same fromIndex & toIndex', () => {
      const state = createState(['123', '456', '789'])
      state.move(1, 1)
      expect(state.value).toEqual(['123', '456', '789'])
      state.move(1, -2)
      expect(state.value).toEqual(['123', '456', '789'])
      state.move(-1, 2)
      expect(state.value).toEqual(['123', '456', '789'])
    })
  })

  it('should reset well', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v))

    const value = ['456', '789']
    state.$.forEach((field, i) => field.onChange(value[i]))
    await delay()
    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should reset well with fields changed', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v))
    let disposeFn: () => void

    state.remove(-1)
    expect(state.dirty).toBe(true)

    disposeFn = state.$[0].dispose = jest.fn(state.$[0].dispose)
    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(disposeFn).toBeCalled()

    state.append('789')
    const field = state.$[state.$.length - 1]
    disposeFn = field.dispose = jest.fn(field.dispose)
    expect(state.dirty).toBe(true)

    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(disposeFn).toBeCalled()

    state.set([])
    expect(state.dirty).toBe(true)

    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)

    state.set(['456', '789', '012'])
    expect(state.dirty).toBe(true)

    disposeFn = state.$[0].dispose = jest.fn(state.$[2].dispose)
    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(disposeFn).toBeCalled()

    state.dispose()
  })

  it('should applyValidation correctly', async () => {
    const state = new ArrayFormState<string>([], v => new FieldState(v)).validators(
      value => value.length <= 0 && 'empty'
    )

    state.validate()
    state.set([])

    await delay()
    expect(state.validated).toBe(true)

    state.dispose()
  })
})

describe('FormState (mode: array) validation', () => {
  it('should work well when initialized', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      list => list.join('').length > 5 && 'too long'
    )

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
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      list => list.join('').length > 5 && 'too long'
    )

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
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      list => list.join('').length > 5 && 'too long'
    )

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
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      list => list.join('').length > 5 && 'too long'
    )

    state.append('456')

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.remove(0, 1)

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      list => list.join('').length > 5 && 'too long'
    )
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
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
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

    state.remove(1)
    state.insert(1, '', '')

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
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
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
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
    state.append('')
    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const options = observable({
      checkLength: true,
      updateCheckLength(value: boolean) {
        this.checkLength = value
      }
    })
    const initialValue = ['123', '456']
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
      list => options.checkLength && list.join('').length > 5 && 'too long',
    )

    state.validate()
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    options.updateCheckLength(false)
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    options.updateCheckLength(true)
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
    const state = new ArrayFormState(initialValue, v => new FieldState(v)).validators(
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

    state.remove(-1)
    state.$[1].onChange('456')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields\' validating', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '']
    const state = new ArrayFormState(
      initialValue,
      value => new FieldState(value).validators(notEmpty),
    ).validators(
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
    const state = new ArrayFormState(
      initialValue,
      value => new FieldState(value).validators(notEmpty),
    ).validators(
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
    const options = observable({
      disabled: false,
      updateDisabled(value: boolean) {
        options.disabled = value
      }
    })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '456']
    const state = new ArrayFormState(
      initialValue,
      value => new FieldState(value).validators(notEmpty),
    ).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(
      () => options.disabled
    )

    options.updateDisabled(true)
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

    options.updateDisabled(false)
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
    const disabledState = new ArrayFormState(
      initialValue,
      value => new FieldState(value).validators(notEmpty),
    ).validators(
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

  it('should provide type-safe result when validate()', async () => {
    const state = new ArrayFormState<string>([], v => new FieldState((v)))
    const res = await state.validate()
    if (res.hasError) {
      assertType<true>(res.hasError)
      assertType<string>(res.error)
    } else {
      assertType<false>(res.hasError)
      assertType<string[]>(res.value)
    }
  })
})

describe('nested FormState', () => {
  it('should work well', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'

    const enabledState = new FieldState(true)

    const createInputDuplicateValidator = (currentInputState: FieldState<string>) => (value: string) => {
      for (const inputState of state.$.inputs.$) {
        if (inputState !== currentInputState && value === inputState.value) {
          return 'duplicated'
        }
      }
    }

    const createInputState = (initialValue: string) => {
      const inputState = new FieldState(initialValue).validators(notEmpty)
      const duplicateValidator = createInputDuplicateValidator(inputState)
      return inputState.validators(duplicateValidator)
    }

    const inputsState = new ArrayFormState([], createInputState).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(() => !enabledState.value)

    const state = new FormState({
      inputs: inputsState,
      enabled: enabledState
    })

    state.$.inputs.append('', '')

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
    state.$.inputs.append('56')

    await delay()
    expect(state.ownError).toBeUndefined()
    expect(state.error).toBe('too long')
    expect(state.$.inputs.error).toBe('too long')
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBeUndefined()
    expect(state.$.inputs.$[2].error).toBeUndefined()
  })

  describe('should set & reset well', () => {
    interface Addr {
      protocols: string[]
      domain: string
    }
    interface SourceConfig {
      type: string
      addrs: Addr[]
    }
    function createAddrState(addr: Addr) {
      return new FormState({
        protocols: new ArrayFormState(addr.protocols, v => new FieldState(v)),
        domain: new FieldState(addr.domain)
      })
    }
    function createAddrsState(addrs: Addr[]) {
      return new ArrayFormState(addrs, createAddrState)
    }
    function createSourceConfigState(sourceConfig: SourceConfig) {
      return new FormState({
        type: new FieldState(sourceConfig.type),
        addrs: createAddrsState(sourceConfig.addrs)
      })
    }

    const addr1 = { protocols: ['http'], domain: '1.com' }
    const addr2 = { protocols: ['http'], domain: '2.com' }
    const addr3 = { protocols: ['https'], domain: '2.com' }

    const initialValue = { type: 'foo', addrs: [addr1] }

    it('with initial status', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with set', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      const value1 = { type: 'bar', addrs: [addr1, addr2] }
      sourceConfigState.set(value1)
      expect(sourceConfigState.value).toEqual(value1)
      expect(sourceConfigState.dirty).toBe(true)

      sourceConfigState.reset()
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with with array empty-set', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      sourceConfigState.$.addrs.set([])
      expect(sourceConfigState.value).toEqual({ ...initialValue, addrs: [] })
      expect(sourceConfigState.dirty).toBe(true)

      sourceConfigState.reset()
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with array set', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      sourceConfigState.$.addrs.set([addr1, addr2, addr3])
      expect(sourceConfigState.value).toEqual({ ...initialValue, addrs: [addr1, addr2, addr3] })
      expect(sourceConfigState.dirty).toBe(true)

      sourceConfigState.reset()
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with field set', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      sourceConfigState.$.addrs.$[0].$.protocols.set(['https'])
      expect(sourceConfigState.value).toEqual({
        ...initialValue,
        addrs: [{ ...addr1, protocols: ['https'] }]
      })
      expect(sourceConfigState.dirty).toBe(true)

      sourceConfigState.reset()
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with array field change', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      sourceConfigState.$.addrs.append(addr3)
      expect(sourceConfigState.value).toEqual({
        ...initialValue,
        addrs: [...initialValue.addrs, addr3]
      })
      expect(sourceConfigState.dirty).toBe(true)

      sourceConfigState.reset()
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with sub-field change', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      sourceConfigState.$.addrs.$[0].$.protocols.set(['http', 'https'])
      expect(sourceConfigState.value).toEqual({
        ...initialValue,
        addrs: [{ ...addr1, protocols: ['http', 'https'] }]
      })
      expect(sourceConfigState.dirty).toBe(true)

      sourceConfigState.reset()
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })

    it('with initialValue-set', () => {
      const sourceConfigState = createSourceConfigState(initialValue)
      sourceConfigState.set(initialValue)
      expect(sourceConfigState.value).toEqual(initialValue)
      expect(sourceConfigState.dirty).toBe(false)
      sourceConfigState.dispose()
    })
  })
})

describe('isFormState', () => {
  it('should work well', () => {
    const fieldFoo = new FieldState('foo')
    const fieldBar = new FieldState(123)
    const objectFormState = new FormState({
      foo: fieldFoo,
      bar: fieldBar
    })
    const arrayFormState1 = new ArrayFormState([1, 2, 3], v => new FieldState(v))
    const arrayFormState2 = new ArrayFormState([{ foo: 'foo', bar: 123 }], v => new FormState({
      foo: new FieldState(v.foo),
      bar: new FieldState(v.bar)
    }))

    expect(isFormState(fieldFoo)).toBe(false)
    expect(isFormState(fieldBar)).toBe(false)
    expect(isFormState(objectFormState)).toBe(true)
    expect(isFormState(arrayFormState1)).toBe(true)
    expect(isFormState(arrayFormState2)).toBe(true)
  })

  it('should work with correct typing info', () => {
    let state: IState<string[]> = new ArrayFormState(
      ['123'],
      v => new FieldState(v)
    )
    if (isFormState(state)) {
      assertType<string>((state.$ as Array<IState<string>>)[0].value)
      assertType<string[]>(state.value)
      assertType<Error>(state.ownError)
    }
  })
})
