import { action, computed, makeObservable, observable, override, reaction } from 'mobx'
import { FieldState } from './fieldState'
import { ValidatableState } from './state'
import { IState, ValidateStatus, ValueOf } from './types'
import { debounce } from './utils'

const defaultDelay = 200 // ms

/**
 * The state for debounce purpose.
 * Changes from the original state (`$`) will be debounced.
 */
export class DebouncedState<S extends IState<V>, V = ValueOf<S>> extends ValidatableState<V> implements IState<V> {

  /**
   * The original state.
   * Use the original state (`$`) for UI binding instead of the debounced state.
   */
  public $: S

  @observable.ref private syncedValue!: V
  @observable.ref private syncedTouched!: boolean
  @observable.ref private syncedActivated!: boolean

  @action private sync() {
    this.syncedValue = this.$.value
    this.syncedTouched = this.$.touched
    this.syncedActivated = this.$.activated
  }

  @computed get value() {
    return this.syncedValue
  }

  @computed get touched() {
    return this.syncedTouched
  }

  @override override get ownError() {
    if (this.disabled) return undefined
    if (this._error) return this._error
    return this.$.ownError
  }

  @override override get error() {
    if (this.disabled) return undefined
    if (this.ownError) return this.ownError
    return this.$.error
  }

  @override override get validateStatus() {
    if (this.disabled) return ValidateStatus.WontValidate
    if (
      this._validateStatus === ValidateStatus.Validating
      || this.$.validateStatus === ValidateStatus.Validating
    ) {
      return ValidateStatus.Validating
    }
    if (
      this._validateStatus === ValidateStatus.Validated
      && this.$.validateStatus === ValidateStatus.Validated
    ) {
      return ValidateStatus.Validated
    }
    return ValidateStatus.NotValidated
  }

  override async validate() {
    this.sync()
    await Promise.all([
      this.$.validate(),
      super.validate()
    ])
    return this.validateResult
  }

  onChange(value: V) {
    this.$.onChange(value)
  }

  set(value: V) {
    this.$.set(value)
    this.sync()
  }

  @override override reset() {
    super.reset()
    this.$.reset()
    this.sync()
  }

  constructor(originalState: S, delay = defaultDelay) {
    super()
    makeObservable(this)

    this.$ = originalState
    this.sync()

    this.init()

    this.addDisposer(reaction(
      () => this.$.value,
      debounce(() => {
        this.sync()
      }, delay)
    ))

    this.addDisposer(reaction(
      () => this.syncedActivated,
      syncedActivated => syncedActivated && !this.activated && (this.activated = syncedActivated),
      { fireImmediately: true, name: 'activate-when-original-state-activated' }
    ))

    this.addDisposer(
      () => this.$.dispose()
    )
  }

}

/**
 * The field state with debounce.
 * Value changes from `onChange` will be debounced.
 */
export class DebouncedFieldState<V> extends DebouncedState<FieldState<V>, V> {
  constructor(initialValue: V, delay = defaultDelay) {
    super(new FieldState(initialValue), delay)
  }
}
