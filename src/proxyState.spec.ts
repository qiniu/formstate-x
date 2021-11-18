import FieldState from './fieldState'
import ProxyState from './proxyState'
import { FormState } from './formState'

describe('ProxyState', () => {

  it('should work well', () => {

    function parseNum(input: string) {
      return parseInt(input, 10)
    }

    function stringifyNum(num: number) {
      return num + ''
    }

    function createNumState() {
      const strState = new FieldState('')
      const state = new ProxyState(strState, parseNum, stringifyNum)
      return state
    }

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
    const sourceItem: SourceItem = sourceItemState.value
    const rawHost: string = sourceItemState.$.host.$.value
  })
})
