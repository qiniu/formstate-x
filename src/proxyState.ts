import { computed } from 'mobx'
import { StateUtils } from './state'
import { IState, Validator } from './types'

export default class ProxyState<Value = any, TargetValue = any, TargetState extends IState<TargetValue> = IState<TargetValue>> extends StateUtils implements IState<Value> {

  /** The proxy-target state */
  public $: TargetState

  constructor(
    targetState: TargetState,
    private parseTargetValue: (v: TargetValue) => Value,
    private getTargetValue: (v: Value) => TargetValue
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

  @computed get initialValue() {
    return this.parseTargetValue(this.$.value)
  }

  @computed get error() {
    return this.$.error
  }

  @computed get validationDisabled() {
    return this.$.validationDisabled
  }

  @computed get dirty() {
    return this.$.dirty
  }

  @computed get activated() {
    return this.$.activated
  }

  /** Current validate status */
  @computed get validateStatus() { return this.$.validateStatus }

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

  resetWith(initialValue: Value) {
    this.$.resetWith(this.getTargetValue(initialValue))
  }

  dirtyWith(initialValue: Value) {
    return this.$.dirtyWith(this.getTargetValue(initialValue))
  }

  validators(...validators: Array<Validator<Value>>) {
    const rawValidators = validators.map(validator => (
      (rawValue: TargetValue) => validator(this.parseTargetValue(rawValue))
    ))
    this.$.validators(...rawValidators)
    return this
  }

  disableValidationWhen(predict: () => boolean) {
    this.$.disableValidationWhen(predict)
    return this
  }

}
