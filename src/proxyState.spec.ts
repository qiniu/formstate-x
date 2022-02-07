import { observable, runInAction, when } from 'mobx'
import { ValidateResultWithError, ValidateResultWithValue } from './types'
import ProxyState from './proxyState'
import FieldState from './fieldState'
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
  return new ProxyState(
    new FieldState(stringifyNum(initialValue)),
    parseNum,
    stringifyNum
  )
}

describe('ProxyState (for FieldState)', () => {

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
      return new ProxyState(rawState, parseHost, stringifyHost)
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

    expect(state.initialValue).toBe(initialValue)
    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should onChange well', async () => {
    const initialValue = 0
    const state = createNumState(initialValue).validators(
      value => value > 100 && 'too big'
    )

    const value = 10
    state.onChange(value)
    await delay()
    expect(state.value).toBe(value)
    expect(state.dirty).toBe(true)

    const newValue = 100
    state.onChange(50)
    state.onChange(newValue)
    await delay()
    expect(state.value).toBe(newValue)
    expect(state.dirty).toBe(true)

    const invalidValue = 200
    state.onChange(invalidValue)
    await delay()
    expect(state.value).toBe(invalidValue)

    state.dispose()
  })

  it('should set well', async () => {
    const initialValue = 0
    const state = createNumState(initialValue)

    const value = 123
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
    const initialValue = 0
    const state = createNumState(initialValue)

    state.onChange(123)
    await delay()
    state.reset()

    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.onChange(456)
    state.reset()

    expect(state.value).toBe(initialValue)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should resetWith well', async () => {
    const state = createNumState(0)

    state.onChange(10)
    await delay()
    state.resetWith(1)

    expect(state.value).toBe(1)
    expect(state.dirty).toBe(false)

    state.onChange(50)
    state.reset()

    expect(state.value).toBe(1)
    expect(state.dirty).toBe(false)

    state.onChange(100)
    state.resetWith(2)

    expect(state.value).toBe(2)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should dirtyWith well', async () => {
    const state = createNumState(0)

    expect(state.dirtyWith(1)).toBe(true)

    state.onChange(1)
    await delay()
    expect(state.dirtyWith(1)).toBe(false)
    expect(state.dirtyWith(0)).toBe(true)

    state.dispose()
  })
})

describe('ProxyState (for FieldState) validation', () => {

  function createPositiveNumState(initialValue: number) {
    return createNumState(initialValue).validators(
      v => v > 0 ? null : 'non positive'
    )
  }

  it('should work well when initialized', async () => {
    const state = createPositiveNumState(0)

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with onChange()', async () => {
    const state = createPositiveNumState(1)
    state.onChange(0)

    await delay()
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)

    state.onChange(2)
    state.onChange(3)
    state.onChange(-1)

    await delay()
    expect(state.error).toBe('non positive')

    state.dispose()
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

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = 0
    const state = createPositiveNumState(initialValue)
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
    const state = createNumState(0).validators(
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

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const state = createNumState(0).validators(
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

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const state = createNumState(0).validators(
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

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const target = observable({ value: 5 })
    const state = createNumState(0).validators(
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

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const state = createNumState(0).validators(
      v => delayValue(v > 0 ? null : 'non positive')
    )
    state.onChange(100)

    await delay()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.validators(v => v > 10 && 'too big')
    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too big')

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const initialValue = 0
    const options = observable({ disabled: false })
    const state = createPositiveNumState(initialValue).disableValidationWhen(
      () => options.disabled
    )

    expect(state.validationDisabled).toBe(false)

    runInAction(() => options.disabled = true)

    const validated = state.validate()
    expect(state.validationDisabled).toBe(true)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)

    await validated
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

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

    runInAction(() => options.disabled = false)
    await delay()
    expect(state.validationDisabled).toBe(false)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('non positive')

    state.dispose()
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
  return new ProxyState(rawState, stringifyHost, parseHost)
}

describe('ProxyState (for FormState)', () => {

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
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should set well', async () => {
    const state = createHostState('127.0.0.1:80')

    state.set('qiniu.com:443')

    expect(state.value).toEqual('qiniu.com:443')
    expect(state.$.$.hostname.value).toBe('qiniu.com')
    expect(state.$.$.port.value).toBe(443)
    expect(state.dirty).toBe(true)

    state.set('127.0.0.1:80')
    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should onChange well', async () => {
    const state = createHostState('127.0.0.1:80')

    state.onChange('qiniu.com:443')
    await delay()
    expect(state.value).toEqual('qiniu.com:443')
    expect(state.$.$.hostname.value).toBe('qiniu.com')
    expect(state.$.$.port.value).toBe(443)
    expect(state.dirty).toBe(true)

    state.reset()

    state.onChange('127.0.0.1:80')
    await delay()
    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.dirty).toBe(false)

    state.dispose()
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
    expect(state.dirty).toBe(false)

    state.onChange('qiniu.com:443')
    await delay()
    state.reset()

    expect(state.value).toEqual('127.0.0.1:80')
    expect(state.$.$.hostname.value).toBe('127.0.0.1')
    expect(state.$.$.port.value).toBe(80)
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('ProxyState (for FormState) validation', () => {
  it('should work well when initialized', async () => {
    const state = createHostState('127.0.0.1:80').validators(
      v => !v && 'empty'
    )

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  describe('should work well with onChange()', () => {

    it('and form validator', async () => {
      const state = createHostState('127.0.0.1:80').validators(
        v => !v && 'empty'
      )
  
      state.onChange('')
      await delay()
      expect(state.validating).toBe(false)
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('empty')

      state.dispose()
    })

    it('and field validator', async () => {
      const state = createHostState('127.0.0.1:80')
      state.$.$.hostname.validators(v => !v && 'empty')

      state.onChange(':443')
      await delay()
      expect(state.validating).toBe(false)
      expect(state.hasError).toBe(true)
      expect(state.error).toBe('empty')

      state.dispose()
    })
  })

  it('should work well with fields onChange()', async () => {
    const state = createHostState('127.0.0.1').validators(
      v => !v && 'empty'
    )

    state.$.$.hostname.onChange('')

    await delay()
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with validate()', async () => {
    const state = createHostState('').validators(
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

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const state = createHostState('').validators(
      v => !v && 'empty'
    )
    state.validate()
    await delay()

    state.reset()
    expect(state.value).toEqual('')
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const options = observable({
      disabled: false,
      updateDisabled(value: boolean) {
        this.disabled = value
      }
    })
    const state = createHostState('127.0.0.1').validators(
      v => !v && 'empty'
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
    expect(state.error).toBeUndefined()

    state.$.$.hostname.onChange('')
    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    options.updateDisabled(false)

    await delay()
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.$.hostname.onChange('qiniu.com')
    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })
})
