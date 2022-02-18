import { FieldState, FormState, ArrayFormState, TransformedState, DebouncedState, DebouncedFieldState, bindInput } from '.'
import { defaultDelay, delay } from './testUtils'

describe('FieldState', () => {
  it('should be newable', () => {
    expect(typeof FieldState).toBe('function')
    expect(FieldState.prototype).toBeTruthy()
  })
})

describe('FormState', () => {
  it('should be newable', () => {
    expect(typeof FormState).toBe('function')
    expect(FormState.prototype).toBeTruthy()
  })
})

describe('ArrayFormState', () => {
  it('should be newable', () => {
    expect(typeof ArrayFormState).toBe('function')
    expect(ArrayFormState.prototype).toBeTruthy()
  })
})

describe('bindInput', () => {
  it('should be callable', () => {
    expect(typeof bindInput).toBe('function')
  })
})

describe('Composition', () => {
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

  function createHostState(hostStr: string) {
    const host = parseHost(hostStr)
    const rawState = new FormState({
      hostname: new DebouncedFieldState(host.hostname, defaultDelay).withValidator(
        v => !v && 'empty hostname'
      ),
      port: new FieldState(host.port)
    })
    return new TransformedState(rawState, stringifyHost, parseHost).withValidator(
      v => !v && 'empty'
    )
  }

  function createDebouncedHostState(hostStr: string) {
    const host = parseHost(hostStr)
    const rawState = new FormState({
      hostname: new FieldState(host.hostname).withValidator(
        v => !v && 'empty hostname'
      ),
      port: new FieldState(host.port)
    })
    return new DebouncedState(
      new TransformedState(rawState, stringifyHost, parseHost),
      defaultDelay
    ).withValidator(
      v => !v && 'empty'
    )
  }

  it('should work well', async () => {
    const initialValue = '127.0.0.1:80'
    const hostState = createHostState(initialValue)

    expect(hostState.value).toBe(initialValue)
    expect(hostState.hasError).toBe(false)

    hostState.set('')
    await delay()
    expect(hostState.hasError).toBe(false)

    hostState.reset()
    hostState.onChange('')
    await delay()
    expect(hostState.value).toBe('')
    expect(hostState.hasError).toBe(true)
    expect(hostState.error).toBe('empty')

    hostState.set(initialValue)
    await delay()
    expect(hostState.hasError).toBe(false)

    hostState.$.$.hostname.$.onChange('')
    await delay()
    expect(hostState.value).toBe(':80')
    expect(hostState.hasError).toBe(true)
    expect(hostState.error).toBe('empty hostname')
  })

  it('should work well with debounced TransformedState', async () => {
    const initialValue = '127.0.0.1:80'
    const hostState = createDebouncedHostState(initialValue)

    expect(hostState.value).toBe(initialValue)
    expect(hostState.hasError).toBe(false)

    hostState.set('')
    await delay()
    expect(hostState.hasError).toBe(false)

    hostState.reset()
    hostState.onChange('')
    await delay()
    expect(hostState.value).toBe('')
    expect(hostState.hasError).toBe(true)
    expect(hostState.error).toBe('empty')

    hostState.set(initialValue)
    await delay()
    expect(hostState.hasError).toBe(false)

    hostState.$.$.$.hostname.onChange('')
    await delay()
    expect(hostState.value).toBe(':80')
    expect(hostState.hasError).toBe(true)
    expect(hostState.error).toBe('empty hostname')
  })
})
