import { computed } from 'mobx'
import { State } from './types'
import Disposable from './disposable'

export default class ProxyState<TValue = any, TRawValue = any> extends Disposable implements State<TValue> {

  constructor(
    private raw: State<TRawValue>,
    private parseRawValue: (v: TRawValue) => TValue,
    private getRawValue: (v: TValue) => TRawValue
  ) {
    super()
    this.addDisposer(() => this.raw.dispose())
  }

  @computed get $() {
    return this.raw
  }

  @computed get value() {
    return this.parseRawValue(this.raw.value)
  }

  @computed get hasError() {
    return this.raw.hasError
  }

  @computed get error() {
    return this.raw.error
  }

  @computed get validating() {
    return this.raw.validating
  }

  @computed get validated() {
    return this.raw.validated
  }

  @computed get validationDisabled() {
    return this.raw.validationDisabled
  }

  @computed get dirty() {
    return this.raw.dirty
  }

  @computed get _activated() {
    return this.raw._activated
  }

  @computed get _validateStatus() {
    return this.raw._validateStatus
  }

  async validate() {
    const result = await this.raw.validate()
    if (result.hasError) return result
    return { ...result, value: this.value }
  }

  set(value: TValue) {
    this.raw.set(this.getRawValue(value))
  }

  onChange(value: TValue) {
    this.raw.onChange(this.getRawValue(value))
  }

  reset() {
    this.raw.reset()
  }

  resetWith(initialValue: TValue) {
    this.raw.resetWith(this.getRawValue(initialValue))
  }

  _dirtyWith(initialValue: TValue) {
    return this.raw._dirtyWith(this.getRawValue(initialValue))
  }

}
