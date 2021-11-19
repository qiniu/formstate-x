import { computed } from 'mobx'
import { IState } from './types'
import State from './state'

export default class ProxyState<TValue = any, TRawValue = any> extends State<TValue> implements IState<TValue> {

  constructor(
    private $: IState<TRawValue>,
    private parseRawValue: (v: TRawValue) => TValue,
    private getRawValue: (v: TValue) => TRawValue
  ) {
    super()
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

  @computed protected get rawValidateStatus() {
    return this.$.validateStatus
  }

  async validate() {
    const result = await this.$.validate()
    if (result.hasError) return result
    return { ...result, value: this.value }
  }

  set(value: TValue) {
    this.$.set(this.getRawValue(value))
  }

  onChange(value: TValue) {
    this.$.onChange(this.getRawValue(value))
  }

  reset() {
    this.$.reset()
  }

  resetWith(initialValue: TValue) {
    this.$.resetWith(this.getRawValue(initialValue))
  }

  dirtyWith(initialValue: TValue) {
    return this.$.dirtyWith(this.getRawValue(initialValue))
  }

}
