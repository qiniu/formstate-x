import { Disposer } from './types'

export default class Disposable {

  private disposers: Disposer[] = []

  protected addDisposer(disposer: Disposer) {
    this.disposers.push(disposer)
  }

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
