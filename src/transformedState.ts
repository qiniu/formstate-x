import { computed } from 'mobx'
import { BaseState } from './state'
import { IState, Validator, ValueOf } from './types'

export class TransformedState<S extends IState<$V>, V, $V = ValueOf<S>, SV extends V = V> extends BaseState implements IState<V, SV> {

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

  @computed get safeValue() {
    if (!this.validated || this.hasError) throw new Error('TODO')
    return this.value as SV
  }

  @computed get ownError() {
    return this.$.ownError
  }

  @computed get error() {
    return this.$.error
  }

  @computed get touched() {
    return this.$.touched
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
    return { ...result, value: this.value as SV }
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

  withValidator<NSV = SV>(...validators: Array<Validator<V>>): (this & { safeValue: NSV }) {
    const rawValidators = validators.map(validator => (
      (rawValue: $V) => validator(this.parseOriginalValue(rawValue))
    ))
    this.$.withValidator(...rawValidators)
    return this as (this & { safeValue: NSV })
  }

  disableWhen(predict: () => boolean) {
    this.$.disableWhen(predict)
    return this
  }

}
