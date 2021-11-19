import { computed } from 'mobx'
import { StateUtils } from './state'
import { IState, Validator } from './types'

export default class ProxyState<Value = any, RawValue = any, S extends IState<RawValue> = IState<any>> extends StateUtils implements IState<Value> {

  /** The proxied state */
  public $: S

  constructor(
    state: S,
    private parseRawValue: (v: RawValue) => Value,
    private getRawValue: (v: Value) => RawValue
  ) {
    super()
    this.$ = state
    this.addDisposer(
      () => this.$.dispose()
    )
  }

  @computed get value() {
    return this.parseRawValue(this.$.value)
  }

  @computed get initialValue() {
    return this.parseRawValue(this.$.value)
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

  @computed get validateStatus() { return this.$.validateStatus }

  async validate() {
    const result = await this.$.validate()
    if (result.hasError) return result
    return { ...result, value: this.value }
  }

  set(value: Value) {
    this.$.set(this.getRawValue(value))
  }

  onChange(value: Value) {
    this.$.onChange(this.getRawValue(value))
  }

  reset() {
    this.$.reset()
  }

  resetWith(initialValue: Value) {
    this.$.resetWith(this.getRawValue(initialValue))
  }

  dirtyWith(initialValue: Value) {
    return this.$.dirtyWith(this.getRawValue(initialValue))
  }

  validators(...validators: Array<Validator<Value>>) {
    const rawValidators = validators.map(validator => (
      (rawValue: RawValue) => validator(this.parseRawValue(rawValue))
    ))
    this.$.validators(...rawValidators)
    return this
  }

  disableValidationWhen(predict: () => boolean) {
    this.$.disableValidationWhen(predict)
    return this
  }

}
