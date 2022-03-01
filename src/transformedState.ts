import { computed } from 'mobx'
import { BaseState } from './state'
import { IState, Validator, ValueOf } from './types'

export class TransformedState<S extends IState<$V>, V, $V = ValueOf<S>> extends BaseState implements IState<V> {

  /** The original state, whose value will be transformed. */
  public $: S

  constructor(
    originalState: S,
    private parseOriginalValue: (v: $V) => V,
    private getOriginalValue: (v: V) => $V
  ) {
    super()
    this.$ = originalState
    this.addDisposer(
      () => this.$.dispose()
    )
  }

  @computed get value() {
    return this.parseOriginalValue(this.$.value)
  }

  @computed get ownError() {
    return this.$.ownError
  }

  @computed get error() {
    return this.$.error
  }

  @computed get dirty() {
    return this.$.dirty
  }

  @computed get activated() {
    return this.$.activated
  }

  @computed get validateStatus() {
    return this.$.validateStatus
  }

  async validate() {
    const result = await this.$.validate()
    if (result.hasError) return result
    return { ...result, value: this.value }
  }

  set(value: V) {
    this.$.set(this.getOriginalValue(value))
  }

  onChange(value: V) {
    this.$.onChange(this.getOriginalValue(value))
  }

  reset() {
    this.$.reset()
  }

  withValidator(...validators: Array<Validator<V>>) {
    const rawValidators = validators.map(validator => (
      (rawValue: $V) => validator(this.parseOriginalValue(rawValue))
    ))
    this.$.withValidator(...rawValidators)
    return this
  }

  disableWhen(predict: () => boolean) {
    this.$.disableWhen(predict)
    return this
  }

}
