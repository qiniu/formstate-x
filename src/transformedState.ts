import { computed } from 'mobx'
import { BaseState } from './state'
import { IState, Validator, ValueOf } from './types'

export class TransformedState<S extends IState, V> extends BaseState implements IState<V> {

  /** The original state, whose value will be transformed. */
  public $: S

  constructor(
    originalState: S,
    private parseTargetValue: (v: ValueOf<S>) => V,
    private getTargetValue: (v: V) => ValueOf<S>
  ) {
    super()
    this.$ = originalState
    this.addDisposer(
      () => this.$.dispose()
    )
  }

  @computed get value() {
    return this.parseTargetValue(this.$.value)
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
    this.$.set(this.getTargetValue(value))
  }

  onChange(value: V) {
    this.$.onChange(this.getTargetValue(value))
  }

  reset() {
    this.$.reset()
  }

  withValidator(...validators: Array<Validator<V>>) {
    const rawValidators = validators.map(validator => (
      (rawValue: ValueOf<S>) => validator(this.parseTargetValue(rawValue))
    ))
    this.$.withValidator(...rawValidators)
    return this
  }

  disableWhen(predict: () => boolean) {
    this.$.disableWhen(predict)
    return this
  }

}
