import { observable, runInAction } from 'mobx'
import * as v2 from 'formstate-x-v2'
import * as v3 from '..'

import { defaultDelay, delay, delayValue } from '../testUtils'
import { fromV2, toV2 } from './v2'
import { BaseState } from '../state'

describe('fromV2', () => {
  describe('with field state', () => {
    it('should work well', () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2)

      expect(state.value).toBe('')
      expect(state.touched).toBe(false)
      expect(state.activated).toBe(false)
      expect<typeof stateV2>(state.$).toBe(stateV2)
    })

    it('should onChange well', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2)

      stateV2.onChange('foo')

      await delay()
      expect(state.touched).toBe(true)
      expect(state.value).toBe('foo')
      expect(state.activated).toBe(true)

      state.onChange('bar')

      await delay()
      expect(stateV2._value).toBe('bar')
      expect(stateV2.value).toBe('bar')
      expect(stateV2.$).toBe('bar')
      expect(state.touched).toBe(true)
      expect(state.value).toBe('bar')
    })

    it('should set well', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2)

      stateV2.set('foo')
      expect(state.touched).toBe(true)
      expect(state.value).toBe('foo')
      expect(state.activated).toBe(false)

      state.set('bar')
      expect(stateV2.dirty).toBe(true)
      expect(stateV2._value).toBe('bar')
      expect(stateV2.value).toBe('bar')
      expect(state.touched).toBe(true)
      expect(state.value).toBe('bar')
      expect(state.activated).toBe(false)
    })

    it('should reset well', async () => {
      const initialValue = ''
      const stateV2 = new v2.FieldState(initialValue, defaultDelay)
      const state = fromV2(stateV2)

      state.onChange('123')
      await delay()
      state.reset()

      expect(stateV2.value).toBe(initialValue)
      expect(stateV2.dirty).toBe(false)
      expect(state.value).toBe(initialValue)
      expect(state.touched).toBe(false)
      expect(state.activated).toBe(false)

      state.onChange('456')
      state.reset()

      expect(stateV2.value).toBe(initialValue)
      expect(stateV2.dirty).toBe(false)
      expect(state.value).toBe(initialValue)
      expect(state.touched).toBe(false)
      expect(state.activated).toBe(false)

      state.dispose()
    })

    it('should dispose well', () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const dispose = stateV2.dispose = jest.fn(stateV2.dispose)
      const state = fromV2(stateV2)

      state.dispose()
      expect(dispose).toBeCalledTimes(1)
    })
  })
  describe('with field state validation', () => {
    it('should work well when initialized', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2).withValidator(val => !val && 'empty')

      expect(state.validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)
    })
    it('should work well with onChange', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2).withValidator(val => !val && 'empty')

      state.onChange('123')
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      state.onChange('')
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
      expect(state.ownError).toBe('empty')
    })
    it('should work well with v2-state onChange', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2).withValidator(val => !val && 'empty')

      stateV2.onChange('123')
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe(undefined)

      stateV2.onChange('')
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
    })
    it('should work well with validate()', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2).withValidator(val => !val && 'empty')
      const validateRet1 = state.validate()

      await delay()
      expect(stateV2._validateStatus).toBe(v2.ValidateStatus.Validated)
      expect(stateV2.error).toBe('empty')
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')

      const validateResult1 = await validateRet1
      expect(validateResult1.hasError).toBe(true)
      expect((validateResult1 as v3.ValidateResultWithError).error).toBe('empty')

      state.onChange('sth')
      const validateRet2 = state.validate()
      await delay()
      expect(stateV2._validateStatus).toBe(v2.ValidateStatus.Validated)
      expect(stateV2.error).toBe(undefined)
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe(undefined)

      const validateResult2 = await validateRet2
      expect(validateResult2.hasError).toBe(false)
      expect((validateResult2 as v3.ValidateResultWithValue<string>).value).toBe('sth')
    })
    it('should work well with async validator', async () => {
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2).withValidator(val => delayValue(!val && 'empty'))

      const validateRet = state.validate()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validating)
      const validated = await validateRet
      expect(validated).toEqual({ hasError: true, error: 'empty' })
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
    })
    it('should work well with reset()', async () => {
      const initialValue = ''
      const stateV2 = new v2.FieldState(initialValue, defaultDelay)
      const state = fromV2(stateV2).withValidator(val => !val && 'empty')
      state.validate()
      await delay()

      state.reset()
      expect(stateV2.value).toBe(initialValue)
      expect(stateV2.dirty).toBe(false)
      expect(stateV2._validateStatus).toBe(v2.ValidateStatus.NotValidated)
      expect(stateV2.error).toBe(undefined)
      expect(state.value).toBe(initialValue)
      expect(state.touched).toBe(false)
      expect(state.validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      state.dispose()
    })
    it('should work well with disableWhen()', async () => {
      const options = observable({ disabled: false })
      const stateV2 = new v2.FieldState('', defaultDelay)
      const state = fromV2(stateV2).withValidator(
        val => !val && 'empty'
      ).disableWhen(
        () => options.disabled
      )

      runInAction(() => options.disabled = true)

      const validated = state.validate()
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)

      await validated
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      state.onChange('123')
      await delay()
      state.onChange('')
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)

      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      runInAction(() => options.disabled = false)
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
      expect(state.ownError).toBe('empty')

      state.dispose()
    })
  })

  function createV2FormState(initialFooValue: string) {
    return new v2.FormState({
      foo: new v2.FieldState(initialFooValue, defaultDelay)
    })
  }

  describe('with form state', () => {

    it('should work well', () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2)

      expect(state.value).toEqual({ foo: '' })
      expect(state.touched).toBe(false)
      expect(state.activated).toBe(false)
      expect<typeof stateV2>(state.$).toBe(stateV2)
    })

    it('should onChange well', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2)

      state.onChange({ foo: 'foo' })

      await delay()
      expect(state.touched).toBe(true)
      expect(state.value).toEqual({ foo: 'foo' })
      expect(state.activated).toBe(true)

      state.onChange({ foo: 'bar' })

      await delay()
      expect(stateV2.$.foo._value).toBe('bar')
      expect(stateV2.$.foo.value).toBe('bar')
      expect(stateV2.dirty).toBe(true)
      expect(stateV2.value).toEqual({ foo: 'bar' })
      expect(state.touched).toBe(true)
      expect(state.value).toEqual({ foo: 'bar' })
      expect(state.activated).toBe(true)
    })

    it('should set well', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2)

      state.set({ foo: 'foo' })
      expect(state.touched).toBe(true)
      expect(state.value).toEqual({ foo: 'foo' })
      expect(state.activated).toBe(false)

      state.set({ foo: 'bar' })
      expect(stateV2.$.foo._value).toBe('bar')
      expect(stateV2.$.foo.value).toBe('bar')
      expect(stateV2.dirty).toBe(true)
      expect(stateV2.value).toEqual({ foo: 'bar' })
      expect(state.touched).toBe(true)
      expect(state.value).toEqual({ foo: 'bar' })
      expect(state.activated).toBe(false)
    })

    it('should reset well', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2)

      state.onChange({ foo: 'foo' })
      await delay()
      state.reset()

      expect(stateV2.value).toEqual({ foo: '' })
      expect(stateV2.dirty).toBe(false)
      expect(state.value).toEqual({ foo: '' })
      expect(state.touched).toBe(false)
      expect(state.activated).toBe(false)

      state.onChange({ foo: 'bar' })
      state.reset()

      expect(stateV2.value).toEqual({ foo: '' })
      expect(stateV2.dirty).toBe(false)
      expect(state.value).toEqual({ foo: '' })
      expect(state.touched).toBe(false)
      expect(state.activated).toBe(false)

      state.dispose()
    })

    it('should dispose well', () => {
      const stateV2 = createV2FormState('')
      const dispose = stateV2.dispose = jest.fn(stateV2.dispose)
      const state = fromV2(stateV2)

      state.dispose()
      expect(dispose).toBeCalledTimes(1)
    })
  })
  describe('with form state validation', () => {

    function createV2FormState(initialFooValue: string) {
      return new v2.FormState({
        foo: new v2.FieldState(initialFooValue, defaultDelay)
      })
    }

    it('should work well when initialized', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2).withValidator(val => !val.foo && 'empty')

      expect(state.validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)
    })
    it('should work well with onChange', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2).withValidator(val => !val.foo && 'empty')

      state.onChange({ foo: '123' })
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      state.onChange({ foo: '' })
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
      expect(state.ownError).toBe('empty')
    })
    it('should work well with v2-state onChange', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2).withValidator(val => !val.foo && 'empty')

      stateV2.$.foo.onChange('123')
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      stateV2.$.foo.onChange('')
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
      expect(state.ownError).toBe('empty')
    })
    it('should work well with validate()', async () => {
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2).withValidator(val => !val.foo && 'empty')
      const validateRet1 = state.validate()

      await delay()
      expect(stateV2._validateStatus).toBe(v2.ValidateStatus.Validated)
      expect(stateV2.error).toBe('empty')
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
      expect(state.ownError).toBe('empty')

      const validateResult1 = await validateRet1
      expect(validateResult1.hasError).toBe(true)
      expect((validateResult1 as v3.ValidateResultWithError).error).toBe('empty')

      state.onChange({ foo: 'sth' })
      const validateRet2 = state.validate()
      await delay()
      expect(stateV2._validateStatus).toBe(v2.ValidateStatus.Validated)
      expect(stateV2.error).toBe(undefined)
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      const validateResult2 = await validateRet2
      expect(validateResult2.hasError).toBe(false)
      expect((validateResult2 as v3.ValidateResultWithValue<{ foo: string }>).value).toEqual({ foo: 'sth' })
    })

    it('should work well with reset()', async () => {
      const initialValue = { foo: '' }
      const stateV2 = createV2FormState(initialValue.foo).validators(val => !val.foo && 'empty')
      const state = fromV2(stateV2)
      state.validate()
      await delay()

      state.reset()
      expect(stateV2.value).toEqual(initialValue)
      expect(stateV2.dirty).toBe(false)
      expect(stateV2._validateStatus).toBe(v2.ValidateStatus.NotValidated)
      expect(stateV2.error).toBe(undefined)
      expect(state.value).toEqual(initialValue)
      expect(state.touched).toBe(false)
      expect(state.validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      state.dispose()
    })

    it('should work well with disableWhen()', async () => {
      const options = observable({ disabled: false })
      const stateV2 = createV2FormState('')
      const state = fromV2(stateV2).withValidator(
        val => !val.foo && 'empty'
      ).disableWhen(
        () => options.disabled
      )

      runInAction(() => options.disabled = true)

      const validated = state.validate()
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)

      await validated
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      stateV2.$.foo.onChange('123')
      await delay()
      stateV2.$.foo.onChange('')
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)

      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.WontValidate)
      expect(state.error).toBe(undefined)
      expect(state.ownError).toBe(undefined)

      runInAction(() => options.disabled = false)
      await delay()
      expect(state.validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.error).toBe('empty')
      expect(state.ownError).toBe('empty')

      state.dispose()
    })
  })
  describe('with unsupported behavior', () => {
    function createV2FieldState(initialValue = '') {
      return new v2.FieldState(initialValue, defaultDelay)
    }
    function createV2ArrayFormState() {
      return new v2.FormState([
        createV2FieldState('123'),
        createV2FieldState('456'),
      ])
    }
    it('should throw with array form state\'s onChange() / set()', () => {
      const stateV2 = createV2ArrayFormState()
      const state = fromV2(stateV2)
      expect(() => state.onChange([''])).toThrowError('Operation not supported.')
      expect(() => state.set([''])).toThrowError('Operation not supported.')
    })
    it('should throw with unknown-mode form state\'s onChange() / set()', () => {
      const stateV2 = createV2FormState('')
      stateV2['mode'] = 'UKNOWN_MODE'
      const state = fromV2(stateV2)
      expect(() => state.onChange({ foo: 'foo' })).toThrowError('Operation not supported.')
      expect(() => state.set({ foo: 'foo' })).toThrowError('Operation not supported.')
    })
    class V2DumbState<V> implements v2.ComposibleValidatable<V> {
      constructor(initalValue: V) {
        this.$ = this.value = initalValue
      }
      $: V
      value: V
      hasError = false
      error = undefined
      validating = false
      validated = false
      validationDisabled = false
      async validate() {
        return { hasError: false, value: this.value } as const
      }
      reset() {}
      dispose() {}
      dirty = false
      _activated = false
      _validateStatus = v2.ValidateStatus.NotValidated
    }
    it('should throw with unknown state\'s onChange() / set()', () => {
      const stateV2 = new V2DumbState('')
      const state = fromV2(stateV2)
      expect(() => state.onChange('')).toThrowError('Operation not supported.')
      expect(() => state.set('')).toThrowError('Operation not supported.')
    })
    it('should throw with unknown state\'s withValidator() / disableWhen()', () => {
      const stateV2 = new V2DumbState('')
      const state = fromV2(stateV2)
      expect(() => state.withValidator(() => 'boom')).toThrowError('Operation not supported.')
      expect(() => state.disableWhen(() => true)).toThrowError('Operation not supported.')
    })
    it('should throw with unknown state\'s ownError', () => {
      const stateV2 = new V2DumbState('')
      const state = fromV2(stateV2)
      expect(() => state.ownError).toThrowError('Operation not supported.')
    })
    it('should throw with unknown validate status', () => {
      const stateV2 = new V2DumbState('')
      stateV2._validateStatus = -1
      const state = fromV2(stateV2)
      expect(() => state.validateStatus).toThrowError('Invalid value occurred: -1.')
    })
  })
})

describe('toV2', () => {
  describe('with basic', () => {
    it('should work well', () => {
      const stateV3 = new v3.FieldState('')
      const state = toV2(stateV3)
      expect<string>(state.value).toBe('')
      expect(state.dirty).toBe(false)
      expect<typeof stateV3>(state.$).toBe(stateV3)
    })
    it('should reset well', async () => {
      const stateV3 = new v3.FieldState('')
      const state = toV2(stateV3)

      stateV3.onChange('foo')
      await delay()
      state.reset()

      expect<string>(stateV3.value).toBe('')
      expect(stateV3.touched).toBe(false)
      expect(state.value).toBe('')
      expect(state.dirty).toBe(false)
      expect(state._activated).toBe(false)

      stateV3.onChange('bar')
      state.reset()

      expect(stateV3.value).toBe('')
      expect(stateV3.touched).toBe(false)
      expect(state.value).toBe('')
      expect(state.dirty).toBe(false)
      expect(state._activated).toBe(false)

      state.dispose()
    })
    it('should dispose well', () => {
      const stateV3 = new v3.FieldState('')
      const dispose = stateV3.dispose = jest.fn(stateV3.dispose)
      const state = toV2(stateV3)

      state.dispose()
      expect(dispose).toBeCalledTimes(1)
    })
  })
  describe('validation', () => {
    function createV3State() {
      return new v3.FieldState('').withValidator(v => !v && 'empty')
    }
    it('should work well when initialized', () => {
      const stateV3 = createV3State()
      const state = toV2(stateV3)

      expect(state._validateStatus).toBe(v2.ValidateStatus.NotValidated)
      expect(state.validating).toBe(false)
      expect(state.validated).toBe(false)
      expect(state.hasError).toBe(false)
      expect(state.error).toBeUndefined()
    })

    it('should work well with onChange()', async () => {
      const stateV3 = createV3State()
      const state = toV2(stateV3)
      stateV3.onChange('')
  
      await delay()
      expect(state.validated).toBe(true)
      expect(state.hasError).toBe(true)
  
      stateV3.onChange('123')
      stateV3.onChange('123456')
      stateV3.onChange('')
  
      await delay()
      expect(state.error).toBe('empty')
    })

    it('should work well with validate()', async () => {
      const stateV3 = createV3State()
      const state = toV2(stateV3)
      const validateRet1 = state.validate()

      await delay()
      expect(state.validating).toBe(false)
      expect(state.validated).toBe(true)
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('empty')
  
      const validateResult1 = await validateRet1
      expect(validateResult1.hasError).toBe(true)
      expect((validateResult1 as v2.ValidateResultWithError).error).toBe('empty')

      stateV3.onChange('sth')
      const validateRet2 = state.validate()
      await delay()
      expect(state.validating).toBe(false)
      expect(state.validated).toBe(true)
      expect(state.hasError).toBe(false)
      expect(state.error).toBeUndefined()

      const validateResult2 = await validateRet2
      expect(validateResult2.hasError).toBe(false)
      expect((validateResult2 as v2.ValidateResultWithValue<string>).value).toBe('sth')
    })

    it('should work well with async validator', async () => {
      const stateV3 = new v3.FieldState('').withValidator(val => delayValue(!val && 'empty'))
      const state = toV2(stateV3)

      const validateRet = state.validate()
      expect(state._validateStatus).toBe(v3.ValidateStatus.Validating)
      const validated = await validateRet
      expect(validated).toEqual({ hasError: true, error: 'empty' })
      expect(state._validateStatus).toBe(v3.ValidateStatus.Validated)
    })

    it('should work well with reset()', async () => {
      const stateV3 = createV3State()
      const state = toV2(stateV3)
      state.validate()
      await delay()
  
      state.reset()
      expect(state.value).toBe('')
      expect(state.dirty).toBe(false)
      expect(state.validating).toBe(false)
      expect(state.hasError).toBe(false)
      expect(state.error).toBeUndefined()
    })

    it('should work well with disableWhen()', async () => {
      const options = observable({ disabled: false })
      const stateV3 = createV3State().disableWhen(
        () => options.disabled
      )
      const state = toV2(stateV3)

      runInAction(() => options.disabled = true)

      const validated = state.validate()
      expect(state._validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.validationDisabled).toBe(true)

      await validated
      expect(state._validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.validationDisabled).toBe(true)
      expect(state.error).toBe(undefined)

      stateV3.onChange('123')
      await delay()
      stateV3.onChange('')
      expect(state._validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.validationDisabled).toBe(true)

      await delay()
      expect(state._validateStatus).toBe(v3.ValidateStatus.NotValidated)
      expect(state.validationDisabled).toBe(true)
      expect(state.error).toBe(undefined)

      runInAction(() => options.disabled = false)
      await delay()
      expect(state._validateStatus).toBe(v3.ValidateStatus.Validated)
      expect(state.validationDisabled).toBe(false)
      expect(state.error).toBe('empty')

      state.dispose()
    })
  })
  describe('with unsupported behavior', () => {
    class V3DumbState<V> extends BaseState implements v3.IState<V> {
      constructor(initialValue: V) {
        super()
        this.value = initialValue
      }
      value: V
      touched = false
      ownError = undefined
      error = undefined
      rawError = undefined
      activated = false
      validateStatus = v3.ValidateStatus.NotValidated
      async validate() {
        return { hasError: false, value: this.value } as const
      }
      onChange(_value: V) {}
      set(_value: V) {}
      reset() {}
      withValidator(..._validators: Array<v3.Validator<V>>) { return this }
      disableWhen(_predict: () => boolean) { return this }
    }
    it('should throw with unknown validate status', () => {
      const stateV3 = new V3DumbState('')
      stateV3.validateStatus = -1
      const state = toV2(stateV3)
      expect(() => state._validateStatus).toThrowError('Invalid value occurred: -1.')
    })
  })
})
