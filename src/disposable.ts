import { Disposer } from './types'

/**
 * Class that collects side-effects and dispose them on demand.
 */
export default class Disposable {

  /**
   * Array of disposers.
   */
  private disposers: Disposer[] = []

  /**
   * Collect the disposer function.
   */
  addDisposer(disposer: Disposer) {
    this.disposers.push(disposer)
  }

  /**
   * Do dispose.
   */
  dispose() {
    this.disposers.forEach(
      disposer => disposer()
    )
    this.disposers = []
  }

  constructor() {
    this.dispose = this.dispose.bind(this)
  }

}
