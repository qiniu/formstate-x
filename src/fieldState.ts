import { observable, computed, action, reaction, autorun, when, makeObservable } from 'mobx'
import { IState, Validator, Validated, ValidationResponse, ValidateStatus, Error, ValidateResult, Bindable } from './types'
import { applyValidators, debounce, isPromiseLike } from './utils'
import State from './state'

/**
 * The state for a field.
 */
export default class FieldState<V> extends State<V> implements IState<V>, Bindable<V> {

  /**
   * If activated (with auto validation).
   * Field will only be activated when `validate()` or `onChange()` called.
   */
  @observable activated = false

  dirtyWith(initialValue: V) {
    return this.value !== initialValue
  }

  /**
   * Value that reacts to `onChange` immediately.
   * You should only use it to bind with UI input componnet.
   */
  @observable.ref _value!: V

  /**
   * Value that can be consumed by your code.
   * It's synced from `_value` with debounce of 200ms.
   */
  @observable.ref value!: V

  /**
   * Value that has bean validated with no error, AKA "safe".
   */
  @observable.ref safeValue!: V

  /**
   * The original error info of validation.
   */
  @observable private _error: Error

  /**
   * The error info of validation.
   */
  @computed get error() {
    return this.validationDisabled ? undefined : this._error
  }

  /**
   * Set error info.
   */
  @action setError(error: ValidationResponse) {
    this._error = error ? error : undefined
  }

  /**
   * Set `_value` on change event.
   */
  @action onChange(value: V) {
    this._value = value
  }

  /**
   * Set `value` (& `_value`) synchronously.
   */
  @action set(value: V) {
    this.value = this._value = value
  }

  /**
   * Reset to specific status.
   */
  @action resetWith(initialValue: V) {
    this.safeValue = this.value = this._value = this.initialValue = initialValue
    this.activated = false
    this.rawValidateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
  }

  /**
   * Fire a validation behavior.
   */
  async validate(): Promise<ValidateResult<V>> {
    const validation = this.validation

    action('activate-and-sync-_value-when-validate', () => {
      this.activated = true
      // 若有用户交互产生的变更（因 debounce）尚未同步，同步之，确保本次 validate 结果是相对稳定的
      this.value = this._value
    })()

    // 若 `validation` 未发生变更，意味着未发生新的校验行为
    // 若上边操作未触发自动的校验行为，强制调用之
    if (this.validation === validation) {
      this.doValidation()
    }

    return this.getValidateResult()
  }

  /**
   * Apply validation.
   */
  private async applyValidation() {
    const validation = this.validation
    if (!validation) {
      return
    }

    const error = (
      isPromiseLike(validation.response)
      ? await validation.response
      : validation.response
    )

    if (
      validation !== this.validation // 如果 validation 已过期，则不生效
      || validation.value !== this._value // 如果 value 已过期，则不生效
    ) {
      return
    }

    action('endValidation', () => {
      this.validation = undefined
      this.rawValidateStatus = ValidateStatus.Validated

      if (error !== this.error) {
        this.setError(error)
      }
    })()
  }

  constructor(public initialValue: V, delay = 200) {
    super()

    makeObservable(this)

    this.reset()

    // debounced reaction to `_value` change
    this.addDisposer(reaction(
      () => this._value,
      // use debounce instead of reactionOptions.delay
      // cause the later do throttle in fact, not debounce
      // see https://github.com/mobxjs/mobx/issues/1956
      debounce(() => {
        if (this.value !== this._value) {
          action('sync-value-when-_value-changed', () => {
            this.value = this._value
            this.rawValidateStatus = ValidateStatus.NotValidated
            this.activated = true
          })()
        }
      }, delay),
      { name: 'reaction-when-_value-change' }
    ))

    // auto sync when validate ok: this.value -> this.$
    this.addDisposer(reaction(
      () => this.validated && !this.hasError,
      validateOk => validateOk && (this.safeValue = this.value),
      { name: 'sync-$-when-validatedOk' }
    ))

    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => {
        if (
          this.validationDisabled
          || !this.activated
          || this.value !== this._value // 如果 value 已经过期，则不处理
        ) {
          return
        }
        this.doValidation()
      },
      { name: 'autorun-check-&-doValidation' }
    ))

    // auto apply validate result: this.validation -> this.error
    this.addDisposer(reaction(
      () => this.validation,
      () => this.applyValidation(),
      { name: 'applyValidation-when-validation-change' }
    ))
  }
}
