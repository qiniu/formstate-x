import { observable, computed, action, reaction, autorun, when, makeObservable } from 'mobx'
import { ComposibleValidatable, Validator, Validated, ValidationResponse, ValidateStatus, Error, ValidateResult } from './types'
import { applyValidators, debounce, isPromiseLike } from './utils'
import Disposable from './disposable'

/**
 * The state for a field.
 */
export default class FieldState<TValue> extends Disposable implements ComposibleValidatable<TValue> {

  /**
   * If activated (with auto validation).
   * Field will only be activated when `validate()` or `onChange()` called.
   */
  @observable _activated = false

  /**
   * If value has been touched (different with `initialValue`)
   */
  @computed get dirty() {
    return this.value !== this.initialValue
  }

  /**
   * Value that reacts to `onChange` immediately.
   * You should only use it to bind with UI input componnet.
   */
  @observable.ref _value!: TValue

  /**
   * Value that can be consumed by your code.
   * It's synced from `_value` with debounce of 200ms.
   */
  @observable.ref value!: TValue

  /**
   * Value that has bean validated with no error, AKA "safe".
   */
  @observable.ref $!: TValue

  /**
   * The validate status.
   */
  @observable _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  /**
   * If the state is doing a validation.
   */
  @computed get validating() {
    return this.validationDisabled ? false : this._validateStatus === ValidateStatus.Validating
  }

  /**
   * The original error info of validation.
   */
  @observable _error: Error

  /**
   * The error info of validation.
   */
  @computed get error() {
    return this.validationDisabled ? undefined : this._error
  }

  /**
   * If the state contains error.
   */
  @computed get hasError() {
    return !!this.error
  }

  /**
   * The most recent validation result.
   * If state is disabled and later enabled, the result of the last validation is obtained.
   * If you need to clear the validation result, please use the reset function.
   */
  @computed private get validateResult(): ValidateResult<TValue> {
    return this.hasError
      ? { hasError: true, error: this.error } as const
      : { hasError: false, value: this.value } as const
  }

  /**
   * If the validation has been done.
   * It does not means validation passed.
   */
  @computed get validated() {
    return this.validationDisabled ? false : this._validateStatus === ValidateStatus.Validated
  }

  /**
   * Set error info.
   */
  @action setError(error: ValidationResponse) {
    this._error = error ? error : undefined
  }

  /**
   * List of validator functions.
   */
  @observable.shallow private _validators: Validator<TValue>[] = []

  /**
   * Add validator function.
   */
  @action validators(...validators: Validator<TValue>[]) {
    this._validators.push(...validators)
    return this
  }

  /**
   * Set `_value` on change event.
   */
  @action onChange(value: TValue) {
    this._value = value
  }

  /**
   * Set `value` (& `_value`) synchronously.
   */
  @action set(value: TValue) {
    this.value = this._value = value
  }

  /**
   * Reset to initial status.
   */
  @action reset() {
    this.$ = this.value = this._value = this.initialValue
    this._activated = false
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
  }

  /**
   * Current validation info.
   */
  @observable.ref private validation?: Validated<TValue>

  /**
   * Do validation.
   */
  private _validate() {
    const value = this.value
    // 如果 value 已经过期，则不处理
    if (value !== this._value) {
      return
    }

    action('set-validateStatus-when-_validate', () => {
      this._validateStatus = ValidateStatus.Validating
    })()

    const response = applyValidators(value, this._validators)

    action('set-validation-when-_validate', () => {
      this.validation = { value, response }
    })()
  }

  /**
   * Fire a validation behavior.
   */
  async validate(): Promise<ValidateResult<TValue>> {
    if (this.validationDisabled) {
      return this.validateResult
    }

    const validation = this.validation

    action('activate-and-sync-_value-when-validate', () => {
      this._activated = true
      // 若有用户交互产生的变更（因 debounce）尚未同步，同步之，确保本次 validate 结果是相对稳定的
      this.value = this._value
    })()

    // 若 `validation` 未发生变更，意味着未发生新的校验行为
    // 若上边操作未触发自动的校验行为，强制调用之
    if (this.validation === validation) {
      this._validate()
    }

    // Compatible with formstate
    await when(
      () => this.validationDisabled || this.validated,
      { name: 'return-validate-when-not-validating' }
    )

    return this.validateResult
  }

  /**
   * Method to check if we should disable validation.
   */
  @observable.ref private shouldDisableValidation = () => false

  /** If validation disabled. */
  @computed get validationDisabled() {
    return this.shouldDisableValidation()
  }

  /**
   * Configure when to disable validation.
   */
  @action disableValidationWhen(predict: () => boolean) {
    this.shouldDisableValidation = predict
    return this
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
      this._validateStatus = ValidateStatus.Validated

      if (error !== this.error) {
        this.setError(error)
      }
    })()
  }

  constructor(private initialValue: TValue, delay = 200) {
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
            this._validateStatus = ValidateStatus.NotValidated
            this._activated = true
          })()
        }
      }, delay),
      { name: 'reaction-when-_value-change' }
    ))

    // auto sync when validate ok: this.value -> this.$
    this.addDisposer(reaction(
      () => this.validated && !this.hasError,
      validateOk => validateOk && (this.$ = this.value),
      { name: 'sync-$-when-validatedOk' }
    ))

    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => !this.validationDisabled && this._activated && this._validate(),
      { name: 'autorun-check-&-_validate' }
    ))

    // auto apply validate result: this.validation -> this.error
    this.addDisposer(reaction(
      () => this.validation,
      () => this.applyValidation(),
      { name: 'applyValidation-when-validation-change' }
    ))
  }
}
