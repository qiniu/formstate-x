import { action, computed, makeObservable, observable, reaction } from 'mobx'
import FieldState from './fieldState'
import { HasErrorAndValidateStatus } from './state'
import { IState, ValidateStatus, Validator } from './types'
import { debounce, is } from './utils'

const defaultDelay = 200 // ms

class DebouncedState<
  V = any,
  S extends IState<V> = IState<V>
> extends HasErrorAndValidateStatus implements IState<V> {

  /**
   * The original state.
   * Use the original state (`$`) for UI binding instead of the debounced state.
   */
  public $: S

  @observable.ref value!: V

  @computed private get upToDate() {
    return is(this.value, this.$.value)
  }

  @observable.ref private _dirty!: boolean
  @observable.ref private _activated!: boolean
  @observable.ref private _validateStatus!: ValidateStatus

  @action private sync() {
    if (this.upToDate) return
    this.value = this.$.value
    this._dirty = this.$.dirty
    this._activated = this.$.activated
    this._validateStatus = this.$.validateStatus
  }

  @computed get error() {
    return this.$.error
  }

  @computed get dirty() {
    return this.upToDate ? this.$.dirty : this._dirty
  }

  @computed get activated() {
    return this.upToDate ? this.$.activated : this._activated
  }

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

export default class DebouncedFieldState<V> extends DebouncedState<V, FieldState<V>> {
  constructor(initialValue: V, delay = defaultDelay) {
    super(new FieldState(initialValue), delay)
  }
}
