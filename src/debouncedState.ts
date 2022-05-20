import { action, computed, makeObservable, observable, override, reaction } from 'mobx'
import { FieldState } from './fieldState'
import { ValidatableState } from './state'
import { IState, ValidateStatus, ValueOf } from './types'
import { debounce, isPassed, normalizeError } from './utils'

const defaultDelay = 200 // ms

/** Infomation synced from original state */
type OriginalInfo<V> = Pick<IState<V>, 'activated' | 'touched' | 'error' | 'ownError' | 'hasError'>

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

  /** Debounced version of original value */
  @observable.ref value!: V

  /** Orignal information, same version with current `value` */
  @observable.ref private synced!: OriginalInfo<V>

  /** Original information for current `value` */
  @computed private get original(): OriginalInfo<V> {
    // If current `value` & original value are the same,
    // the direct information from original state is correct and newest for current value
    if (Object.is(this.$.value, this.value)) return this.$
    return this.synced
  }

  /** Sync value and related information from original state */
  @action private sync() {
    this.value = this.$.value
    this.synced = {
      activated: this.$.activated,
      touched: this.$.touched,
      error: this.$.error,
      ownError: this.$.ownError,
      hasError: this.$.hasError
    }
  }

  @computed get touched() {
    return this.original.touched
  }

  @override override get ownError() {
    if (this.disabled) return undefined
    if (this.rawError) return normalizeError(this.rawError)
    return this.original.ownError
  }

  @override override get error() {
    if (this.disabled) return undefined
    if (this.ownError) return this.ownError
    return this.original.error
  }

  @override override get hasError() {
    if (this.disabled) return false
    return !isPassed(this.rawError) || this.original.hasError
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
      () => this.original.activated,
      originalActivated => originalActivated && !this.activated && (this.activated = originalActivated),
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
