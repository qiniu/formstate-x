import { FieldState, FormState, ArrayFormState, TransformedState, DebouncedState, DebouncedFieldState } from '.'
import { assertType, defaultDelay, delay } from './testUtils'

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

    expect<string>(hostState.value).toBe(initialValue)
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

interface HostInput {
  hostname: string | null
  port: number | null
}

function parseHost(input: string): HostInput {
  const [hostname, portStr] = input.split(':')
  const port = parseInt(portStr, 10)
  return { hostname, port }
}

function stringifyHost(host: HostInput) {
  const suffix = (host.port == null || Number.isNaN(host.port)) ? '' : `:${host.port}`
  return host.hostname + suffix
}

function createRawHostState(host: HostInput) {
  const hostnameState = new FieldState<string | null>(host.hostname).withValidator<string>(
    v => !v && 'empty hostname'
  )
  const portState = new FieldState<number | null, number>(host.port)
  return new FormState({
    hostname: hostnameState,
    port: portState
  })
}

function createDebouncedHostState(hostStr: string) {
  const host = parseHost(hostStr)
  const rawState = createRawHostState(host)
  const state = new DebouncedState(
    new TransformedState(rawState, stringifyHost, parseHost),
    defaultDelay
  ).withValidator(
    v => !v && 'empty'
  )
  return state
}

describe('safeValue', () => {
  it('should work well', () => {
    const state = new FieldState<string | null>('foo').withValidator<string>(
      v => v == null && 'empty'
    )
    assertType<string>(state.safeValue)
  })
  it('should work well with multiple validators', () => {
    const state = new FieldState<string | number | null>('foo').withValidator<string | number>(
      v => v == null && 'empty'
    ).withValidator<string>(
      v => typeof v !== 'string' && 'not string'
    )
    assertType<string>(state.safeValue)
  })
  it('should work well with complex states', () => {
    const rawHostState = createRawHostState({ hostname: 'foo', port: 80 })
    assertType<{ hostname: string, port: number }>(rawHostState.safeValue)
  })
})
