import { computed } from 'mobx'
import { BaseState } from './state'
import { IState, Validator, ValueOf } from './types'

export class ProxyState<TargetState extends IState, Value> extends BaseState implements IState<Value> {

  /** The original state, whose value will be transformed. */
  public $: TargetState

  constructor(
    targetState: TargetState,
    private parseTargetValue: (v: ValueOf<TargetState>) => Value,
    private getTargetValue: (v: Value) => ValueOf<TargetState>
  ) {
    super()
    this.$ = targetState
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

  set(value: Value) {
    this.$.set(this.getTargetValue(value))
  }

  onChange(value: Value) {
    this.$.onChange(this.getTargetValue(value))
  }

  reset() {
    this.$.reset()
  }

  validators(...validators: Array<Validator<Value>>) {
    const rawValidators = validators.map(validator => (
      (rawValue: ValueOf<TargetState>) => validator(this.parseTargetValue(rawValue))
    ))
    this.$.validators(...rawValidators)
    return this
  }

  disableValidationWhen(predict: () => boolean) {
    this.$.disableValidationWhen(predict)
    return this
  }

}
