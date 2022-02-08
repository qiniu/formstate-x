import { action, computed, makeObservable, observable, reaction } from 'mobx'
import { FieldState } from './fieldState'
import { HasErrorAndValidateStatus } from './state'
import { Error, IState, ValidateStatus, Validator, ValueOf } from './types'
import { debounce, is } from './utils'

const defaultDelay = 200 // ms

/**
 * The state for debounce purpose.
 * Changes from the original state (`$`) will be debounced.
 */
export class DebouncedState<S extends IState> extends HasErrorAndValidateStatus implements IState<ValueOf<S>> {

  /**
   * The original state.
   * Use the original state (`$`) for UI binding instead of the debounced state.
   */
  public $: S

  @observable.ref value!: ValueOf<S>

  @computed private get upToDate() {
    return is(this.value, this.$.value)
  }

  @observable.ref private _dirty!: boolean
  @observable.ref private _activated!: boolean
  @observable.ref private _error!: Error
  @observable.ref private _validateStatus!: ValidateStatus

  @action private sync() {
    if (this.upToDate) return
    this.value = this.$.value
    this._dirty = this.$.dirty
    this._activated = this.$.activated
    this._error = this.$.error
    this._validateStatus = this.$.validateStatus
  }

  @computed get error() {
    return this.upToDate ? this.$.error : this._error
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

  set(value: ValueOf<S>) {
    this.$.set(value)
    this.sync()
  }

  onChange(value: ValueOf<S>) {
    this.$.onChange(value)
  }

  reset() {
    this.$.reset()
    this.sync()
  }

  validators(...validators: Array<Validator<ValueOf<S>>>) {
    this.$.validators(...validators)
    return this
  }

  disableValidationWhen(predict: () => boolean) {
    this.$.disableValidationWhen(predict)
    return this
  }

  constructor(originalState: S, delay = defaultDelay) {
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

export class DebouncedFieldState<V> extends DebouncedState<FieldState<V>> {
  constructor(initialValue: V, delay = defaultDelay) {
    super(new FieldState(initialValue), delay)
  }
}
