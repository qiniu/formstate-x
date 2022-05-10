import { action, observable, runInAction, when } from 'mobx'
import { ValidateResultWithError, ValidateResultWithValue } from './types'
import { TransformedState } from './transformedState'
import { FieldState } from './fieldState'
import { FormState } from './formState'
import { delay, delayValue, assertType } from './testUtils'

function createNumState(initialValue: number = 0) {
  function parseNum(str: string) {
    const num = parseInt(str, 10)
    return Number.isNaN(num) ? 0 : num
  }
  function stringifyNum(num: number) {
    return Number.isNaN(num) ? '' : (num + '')
  }
  return new TransformedState(
    new FieldState(stringifyNum(initialValue)),
    parseNum,
    stringifyNum
  )
}

describe('TransformedState (for FieldState)', () => {

  it('should be type-safe', () => {

    interface Host {
      hostname: string
      port: number
    }

    function parseHost(input: string): Host {
      const [hostname, portStr] = input.split(':')
      const port = parseInt(portStr, 10)
      return { hostname, port }
    }

    function stringifyHost(host: Host) {
      return [host.hostname, host.port].join(':')
    }

    function createHostState() {
      const rawState = new FieldState('')
      return new TransformedState(rawState, parseHost, stringifyHost)
    }

    interface SourceItem {
      host: Host
      weight: number
    }

    function createSourceItemState() {
      const state = new FormState({
        host: createHostState(),
        weight: createNumState()
      })
      return state
    }

    const sourceItemState = createSourceItemState()
    assertType<SourceItem>(sourceItemState.value)
    assertType<string>(sourceItemState.$.host.$.value)
  })

  it('should initialize well', () => {
    const initialValue = 123
    const state = createNumState(initialValue)

    expect(state.value).toBe(initialValue)
    expect(state.touched).toBe(false)
  })

  it('should onChange well', async () => {
    const initialValue = 0
    const state = createNumState(initialValue).withValidator(
      value => value > 100 && 'too big'
    )

    const value = 10
    state.onChange(value)
    await delay()
    expect(state.value).toBe(value)
    expect(state.touched).toBe(true)

    const newValue = 100
    state.onChange(50)
    state.onChange(newValue)
    await delay()
    expect(state.value).toBe(newValue)
    expect(state.touched).toBe(true)

    const invalidValue = 200
    state.onChange(invalidValue)
    await delay()
    expect(state.value).toBe(invalidValue)
  })

  it('should set well', async () => {
    const initialValue = 0
    const state = createNumState(initialValue)

    const value = 123
    state.set(value)
    expect(state.value).toBe(value)
    expect(state.touched).toBe(true)

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
    expect(state.touched).toBe(true)
  })

  it('should reset well', async () => {
    const initialValue = 0
    const state = createNumState(initialValue)

    state.onChange(123)
    await delay()
    state.reset()

    expect(state.value).toBe(initialValue)
    expect(state.touched).toBe(false)

    state.onChange(456)
    state.reset()

    expect(state.value).toBe(initialValue)
    expect(state.touched).toBe(false)
  })
})

describe('TransformedState (for FieldState) validation', () => {

  function createPositiveNumState(initialValue: number) {
    return createNumState(initialValue).withValidator(
      v => v > 0 ? null : 'non positive'
    )
  }

  it('should work well when initialized', async () => {
    const state = createPositiveNumState(0)

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
  })

  it('should work well with onChange()', async () => {
    const state = createPositiveNumState(1)
    state.onChange(0)

    await delay()
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.hasOwnError).toBe(true)

    state.onChange(2)
    state.onChange(3)
    state.onChange(-1)

    await delay()
    expect(state.error).toBe('non positive')
    expect(state.ownError).toBe('non positive')
  })

  it('should work well with onChange of same value', async () => {
    const state = createPositiveNumState(1)
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
    const state = createPositiveNumState(0)
    const validateRet1 = state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('non positive')

    const validateResult1 = await validateRet1
    expect(validateResult1.hasError).toBe(true)
    expect((validateResult1 as ValidateResultWithError).error).toBe('non positive')

    state.onChange(1)
    const validateRet2 = state.validate()
    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    const validateResult2 = await validateRet2
    expect(validateResult2.hasError).toBe(false)
    expect((validateResult2 as ValidateResultWithValue<number>).value).toBe(1)
  })

  it('should work well with reset()', async () => {
    const initialValue = 0
    const state = createPositiveNumState(initialValue)
    state.validate()
    await delay()

    state.reset()
    expect(state.value).toBe(initialValue)
    expect(state.touched).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
  })

  it('should work well with multiple validators', async () => {
    const state = createNumState(0).withValidator(
      v => v > 0 ? null : 'non positive',
      v => v > 10 && 'too big'
    )
    state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('non positive')

    state.onChange(100)

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too big')

    state.onChange(5)

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well with async validator', async () => {
    const state = createNumState(0).withValidator(
      v => delayValue(v > 0 ? null : 'non positive')
    )
    state.validate()

    await when(() => state.validating)
    expect(state.validating).toBe(true)
    expect(state.validated).toBe(false)

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('non positive')
  })

  it('should work well with mixed sync and async validator', async () => {
    const state = createNumState(0).withValidator(
      v => delayValue(v > 0 ? null : 'non positive'),
      v => v > 10 && 'too big'
    )
    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('non positive')

    state.onChange(100)

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too big')

    state.onChange(5)

    await delay()
    expect(state.error).toBeUndefined()
    expect(state.hasError).toBe(false)
  })

  it('should work well with dynamic validator', async () => {
    const target = observable({ value: 5 })
    const state = createNumState(0).withValidator(
      v => v === target.value && 'same'
    )

    state.onChange(5)
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    runInAction(() => target.value = 10)
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => target.value = 5)
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.onChange(10)
    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well when add validator dynamically', async () => {
    const state = createNumState(0).withValidator(
      v => delayValue(v > 0 ? null : 'non positive')
    )
    state.onChange(100)

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.withValidator(v => v > 10 && 'too big')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too big')
  })

  it('should work well with disableWhen', async () => {
    const initialValue = 0
    const options = observable({ disabled: false })
    const state = createPositiveNumState(initialValue).disableWhen(
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
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()

    state.onChange(10)
    await delay()
    state.onChange(-1)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()

    runInAction(() => options.disabled = false)
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('non positive')
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('non positive')
  })

  it('should work well with resolved error object', async () => {
    const state = createNumState(0).withValidator(
      _ => ({ message: 'empty' })
    )

    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')
    expect(state.ownError).toBe('empty')
    expect(state.rawError).toEqual({ message: 'empty' })
  })
})

interface Host {
  hostname: string
  port: number
}

function parseHost(input: string): Host {
  const [hostname, portStr] = input.split(':')
  const port = parseInt(portStr, 10)
  return { hostname, port }
}

function stringifyHost(host: Host) {
  const suffix = Number.isNaN(host.port) ? '' : `:${host.port}`
  return host.hostname + suffix
}

function createHostState(hostStr: string = '127.0.0.1:80') {
  const host = parseHost(hostStr)
  const rawState = new FormState({
    hostname: new FieldState(host.hostname),
    port: new FieldState(host.port)
  })
  return new TransformedState(rawState, stringifyHost, parseHost)
}

describe('TransformedState (for FormState)', () => {

  it('should be type-safe', () => {

    interface SourceItem {
      host: string
      weight: number
    }

    function createSourceItemState() {
      const state = new FormState({
        host: createHostState(),
        weight: createNumState()
      })
      return state
    }

    const sourceItemState = createSourceItemState()
    assertType<SourceItem>(sourceItemState.value)
    assertType<Host>(sourceItemState.$.host.$.value)
    assertType<string>(sourceItemState.$.host.$.$.hostname.value)
  })

  it('should initialize well', () => {
    const initialValue = 123
    const state = createNumState(initialValue)

    expect(state.value).toBe(initialValue)
    expect(state.touched).toBe(false)
  })

  it('should set well', async () => {
    const state = createHostState('127.0.0.1:80')

    state.set('qiniu.com:443')

    expect(state.value).toEqual('qiniu.com:443')
    expect(state.$.$.hostname.value).toBe('qiniu.com')
    expect(state.$.$.port.value).toBe(443)
    expect(state.touched).toBe(true)

    state.set('127.0.0.1:80')
    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.touched).toBe(true)
  })

  it('should onChange well', async () => {
    const state = createHostState('127.0.0.1:80')

    state.onChange('qiniu.com:443')
    await delay()
    expect(state.value).toEqual('qiniu.com:443')
    expect(state.$.$.hostname.value).toBe('qiniu.com')
    expect(state.$.$.port.value).toBe(443)
    expect(state.touched).toBe(true)

    state.reset()

    state.onChange('127.0.0.1:80')
    await delay()
    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.touched).toBe(true)
  })

  it('should reset well', async () => {
    const state = createHostState('127.0.0.1:80')

    state.$.$.hostname.onChange('qiniu.com')
    state.$.$.port.onChange(443)
    await delay()
    state.reset()

    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.touched).toBe(false)

    state.onChange('qiniu.com:443')
    await delay()
    state.reset()

    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.touched).toBe(false)
  })
})

describe('TransformedState (for FormState) validation', () => {
  it('should work well', async () => {
    const ctrl = observable({
      hasFooError: false,
      hasFormError: false,
      hasTransformedFormError: false
    })
    const fooState = new FieldState('').withValidator(() => ctrl.hasFooError && 'foo error')
    const formState = new FormState({ foo: fooState }).withValidator(() => ctrl.hasFormError && 'form error')
    const state = new TransformedState(formState, v => v, v => v).withValidator(
      () => ctrl.hasTransformedFormError && 'form error'
    )
    await state.validate()
    expect(state.ownError).toBe(undefined)
    expect(state.error).toBe(undefined)

    action(() => {
      ctrl.hasFooError = true
      ctrl.hasFormError = false
      ctrl.hasTransformedFormError = false
    })()
    expect(state.ownError).toBe(undefined)
    expect(state.error).toBe('foo error')

    action(() => {
      ctrl.hasFooError = false
      ctrl.hasFormError = true
      ctrl.hasTransformedFormError = false
    })()
    expect(state.ownError).toBe('form error')
    expect(state.error).toBe('form error')

    action(() => {
      ctrl.hasFooError = false
      ctrl.hasFormError = false
      ctrl.hasTransformedFormError = true
    })()
    expect(state.ownError).toBe('form error')
    expect(state.error).toBe('form error')

    action(() => {
      ctrl.hasFooError = true
      ctrl.hasFormError = true
      ctrl.hasTransformedFormError = false
    })()
    expect(state.ownError).toBe('form error')
    expect(state.error).toBe('form error')

    action(() => {
      ctrl.hasFooError = true
      ctrl.hasFormError = false
      ctrl.hasTransformedFormError = true
    })()
    expect(state.ownError).toBe('form error')
    expect(state.error).toBe('form error')

    action(() => {
      ctrl.hasFooError = false
      ctrl.hasFormError = true
      ctrl.hasTransformedFormError = true
    })()
    expect(state.ownError).toBe('form error')
    expect(state.error).toBe('form error')

    action(() => {
      ctrl.hasFooError = true
      ctrl.hasFormError = true
      ctrl.hasTransformedFormError = true
    })()
    expect(state.ownError).toBe('form error')
    expect(state.error).toBe('form error')
  })

  it('should work well when initialized', async () => {
    const state = createHostState('127.0.0.1:80').withValidator(
      v => !v && 'empty'
    )

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
  })

  describe('should work well with onChange()', () => {

    it('and form validator', async () => {
      const state = createHostState('127.0.0.1:80').withValidator(
        v => !v && 'empty'
      )
  
      state.onChange('')
      await delay()
      expect(state.validating).toBe(false)
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('empty')
      expect(state.hasOwnError).toBe(true)
      expect(state.ownError).toBe('empty')

      state.dispose()
    })

    it('and child state validator', async () => {
      const state = createHostState('127.0.0.1:80')
      state.$.$.hostname.withValidator(v => !v && 'empty')

      state.onChange(':443')
      await delay()
      expect(state.validating).toBe(false)
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('empty')
      expect(state.hasOwnError).toBe(false)
      expect(state.ownError).toBe(undefined)

      state.dispose()
    })
  })

  it('should work well with child states onChange()', async () => {
    const state = createHostState('127.0.0.1').withValidator(
      v => !v && 'empty'
    )

    state.$.$.hostname.onChange('')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('empty')
  })

  it('should work well with validate()', async () => {
    const state = createHostState('').withValidator(
      v => !v && 'empty'
    )

    const validateRet1 = state.validate()

    await delay(1000)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    const validateResult1 = await validateRet1
    expect(validateResult1.hasError).toBe(true)
    expect((validateResult1 as ValidateResultWithError).error).toBe('empty')

    state.$.$.hostname.onChange('qiniu.com')
    const validateRet2 = state.validate()

    await delay()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    const validateResult2 = await validateRet2
    expect(validateResult2.hasError).toBe(false)
    expect((validateResult2 as ValidateResultWithValue<string>).value).toEqual('qiniu.com')
  })

  it('should work well with reset()', async () => {
    const state = createHostState('').withValidator(
      v => !v && 'empty'
    )
    state.validate()
    await delay()

    state.reset()
    expect(state.value).toEqual('')
    expect(state.touched).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
  })

  it('should work well with disableWhen', async () => {
    const options = observable({
      disabled: false,
      updateDisabled(value: boolean) {
        this.disabled = value
      }
    })
    const state = createHostState('127.0.0.1').withValidator(
      v => !v && 'empty'
    ).disableWhen(
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
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()

    state.$.$.hostname.onChange('')
    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()

    options.updateDisabled(false)

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')
    expect(state.hasOwnError).toBe(true)
    expect(state.ownError).toBe('empty')

    state.$.$.hostname.onChange('qiniu.com')
    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()
    expect(state.hasOwnError).toBe(false)
    expect(state.ownError).toBeUndefined()
  })

  it('should work well with resolved error object', async () => {
    const state = createHostState('127.0.0.1').withValidator(
      _ => ({ message: 'mock msg'})
    )

    state.validate()

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('mock msg')
    expect(state.ownError).toBe('mock msg')
    expect(state.rawError).toEqual({ message: 'mock msg' })
  })
})
