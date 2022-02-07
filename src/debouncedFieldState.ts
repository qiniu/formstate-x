import { action, computed, makeObservable, observable, reaction } from 'mobx'
import FieldState from './fieldState'
import { HasErrorAndValidateStatus } from './state'
import { IState, ValidateStatus, Validator } from './types'
import { debounce, is } from './utils'

const defaultDelay = 200 // ms

class DebouncedState<
  V = any,
  S extends FieldState<V> = FieldState<V>
> extends HasErrorAndValidateStatus implements IState<V> {

  /** The original state */
  public $: S

  @observable.ref value!: V

  @computed private get upToDate() {
    return is(this.value, this.$.value)
  }

  @observable.ref private _activated!: boolean
  @observable.ref private _validateStatus!: ValidateStatus

  @action private sync() {
    if (this.upToDate) return
    this.value = this.$.value
    this._activated = this.$.activated
    this._validateStatus = this.$.validateStatus
  }

  @computed get initialValue() {
    return this.$.initialValue
  }

  @computed get error() {
    return this.$.error
  }

  @computed get validationDisabled() {
    return this.$.validationDisabled
  }

  @computed get dirty() {
    return this.dirtyWith(this.initialValue)
  }

  @computed get activated() {
    return this.upToDate ? this.$.activated : this._activated
  }

  /** Current validate status */
  @computed get validateStatus() {
    return this.upToDate ? this.$.validateStatus : this._validateStatus
  }

  async validate() {
    this.sync()
    return this.$.validate()
  }

  set(value: V) {
    this.$.set(value)
    this.sync()
  }

  onChange(value: V) {
    this.$.onChange(value)
  }

  reset() {
    this.$.reset()
    this.sync()
  }

  resetWith(initialValue: V) {
    this.$.resetWith(initialValue)
    this.sync()
  }

  dirtyWith(initialValue: V) {
    // TODO: This only suits FieldState
    return !is(this.value, initialValue)
  }

  validators(...validators: Array<Validator<V>>) {
    this.$.validators(...validators)
    return this
  }

  disableValidationWhen(predict: () => boolean) {
    this.$.disableValidationWhen(predict)
    return this
  }

  constructor(originalState: S, delay: number) {
    super()
    makeObservable(this)

    this.$ = originalState
    this.sync()

    this.addDisposer(reaction(
      () => this.$.value,
      debounce(() => {
        this.sync()
      }, delay)
    ))

    this.addDisposer(
      () => this.$.dispose()
    )
  }

}

export default class DebouncedFieldState<V> extends DebouncedState<V> {
  constructor(initialValue: V, delay = defaultDelay) {
    super(new FieldState(initialValue), delay)
  }
}
