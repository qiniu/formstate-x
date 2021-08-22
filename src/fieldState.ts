import { observable, computed, action, reaction, autorun, when, makeObservable } from 'mobx'
import { Validatable, Validator, Validated, ValidationResponse, ValidateStatus, Error, ValidateResult, RawValueOptions } from './types'
import { debounce, isPromiseLike, responsesAnd } from './utils'
import Disposable from './disposable'

export interface FieldStateInitOptionsWithoutRaw {
  delay?: number
}

export interface FieldStateInitOptionsWithRaw<TValue, TRawValue> extends FieldStateInitOptionsWithoutRaw {
  delay?: number
  rawValue: RawValueOptions<TValue, TRawValue>
}

export type FieldStateInitOptions<TValue, TRawValue> = (
  (<T>() => T extends TValue ? 1 : 2) extends (<T>() => T extends TRawValue ? 1 : 2)
  ? (FieldStateInitOptionsWithoutRaw | FieldStateInitOptionsWithRaw<TValue, TRawValue>)
  : FieldStateInitOptionsWithRaw<TValue, TRawValue>
)

function echo<T>(v: T) {
  return v
}

/**
 * The state for a field.
 */
export default class FieldState<TValue, TRawValue = TValue> extends Disposable implements Validatable<TValue, TRawValue> {

  /**
   * If activated (with auto validation).
   * Field will only be activated when `validate()` or `onChange()` called.
   */
  @observable _activated = false

  _dirtyWith(initialValue: TValue) {
    return this.value !== initialValue
  }

  /**
   * If value has been touched (different with `initialValue`)
   */
  @computed get dirty() {
    return this._dirtyWith(this.initialValue)
  }

  private parseRawValue: (rawValue: TRawValue) => TValue
  private getRawValue: (value: TValue) => TRawValue

  /**
   * Value that reacts to `onChange` immediately.
   * You should only use it to bind with UI input componnet.
   */
  @observable.ref _rawValue!: TRawValue

  @observable.ref private rawValue!: TRawValue

  /**
   * Value that can be consumed by your code.
   * It's synced from `_value` with debounce of 200ms.
   */
  @computed get value(): TValue {
    return this.parseRawValue(this.rawValue)
  }

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
   * List of validator function for value.
   */
  @observable.shallow private _validators: Validator<TValue>[] = []

  /**
   * Add validator functions.
   */
  @action validators(...validators: Validator<TValue>[]) {
    this._validators.push(...validators)
    return this
  }

  /**
   * List of validator function for raw value.
   */
  @observable.shallow private _rawValidators: Validator<TRawValue>[] = []

  /**
   * Add raw validator functions.
   */
  @action rawValidators(...rawValidators: Validator<TRawValue>[]) {
    this._rawValidators.push(...rawValidators)
    return this
  }

  /**
   * Set `_value` on change event.
   */
  @action onChange(value: TRawValue) {
    this._rawValue = value
  }

  /**
   * Set `value` (& `_value`) synchronously.
   */
  @action set(value: TValue) {
    this.rawValue = this._rawValue = this.getRawValue(value)
  }

  /**
   * Reset to specific status.
   */
  @action resetWith(initialValue: TValue) {
    this.initialValue = initialValue
    this.rawValue = this._rawValue = this.getRawValue(initialValue)
    this._activated = false
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
  }

  /**
   * Reset to initial status.
   */
  @action reset() {
    this.resetWith(this.initialValue)
  }

  /**
   * Current validation info.
   */
  @observable.ref private validation?: Validated<TValue, TRawValue>

  /**
   * Do validation.
   */
  private _validate() {
    const { rawValue, value, _rawValidators: rawValidators, _validators: validators } = this
    // 如果 rawValue 已经过期，则不处理
    if (rawValue !== this._rawValue) {
      return
    }

    action('set-validateStatus-when-_validate', () => {
      this._validateStatus = ValidateStatus.Validating
    })()

    function* validate() {
      for (const rawValidator of rawValidators) {
        yield rawValidator(rawValue)
      }
      for (const validator of validators) {
        yield validator(value)
      }
    }

    const response = responsesAnd(validate())

    action('set-validation-when-_validate', () => {
      this.validation = { rawValue, value, response }
    })()
  }

  /**
   * Fire a validation behavior.
   */
  async validate(): Promise<ValidateResult<TValue>> {
    const validation = this.validation

    action('activate-and-sync-_value-when-validate', () => {
      this._activated = true
      // 若有用户交互产生的变更（因 debounce）尚未同步，同步之，确保本次 validate 结果是相对稳定的
      this.rawValue = this._rawValue
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

    return (
      this.hasError
      ? { hasError: true, error: this.error } as const
      : { hasError: false, value: this.value } as const
    )
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
      || validation.rawValue !== this._rawValue // 如果 value 已过期，则不生效
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

  constructor(private initialValue: TValue, options?: FieldStateInitOptions<TValue, TRawValue>) {
    super()
    makeObservable(this)

    const delay = options?.delay ?? 200

    if (options && 'rawValue' in options) {
      const optionsWithRaw = options as FieldStateInitOptionsWithRaw<TValue, TRawValue>
      this.parseRawValue = optionsWithRaw.rawValue.parse
      this.getRawValue = optionsWithRaw.rawValue.get
    } else {
      this.parseRawValue = this.getRawValue = echo as any
    }

    this.reset()

    // debounced reaction to `_value` change
    this.addDisposer(reaction(
      () => this._rawValue,
      // use debounce instead of reactionOptions.delay
      // cause the later do throttle in fact, not debounce
      // see https://github.com/mobxjs/mobx/issues/1956
      debounce(() => {
        if (this.rawValue !== this._rawValue) {
          action('sync-value-when-_value-changed', () => {
            this.rawValue = this._rawValue
            this._validateStatus = ValidateStatus.NotValidated
            this._activated = true
          })()
        }
      }, delay),
      { name: 'reaction-when-_value-change' }
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
