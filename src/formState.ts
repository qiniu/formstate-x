import { observable, computed, isObservable, action, autorun, when, reaction, makeObservable } from 'mobx'
import { ComposibleValidatable, ValueOfFields, ValidationResponse, Validator, Validated, ValidateStatus, Error, ValidateResult } from './types'
import { applyValidators, isPromiseLike, isArrayLike } from './utils'
import Disposable from './disposable'

/** Mode: object */
export type FieldsObject = { [key: string]: ComposibleValidatable<any> }
/** Mode: array */
export type FieldsArray = ComposibleValidatable<any>[]
/** Each key of the object is a validatable */
export type ValidatableFields = FieldsObject | FieldsArray

/**
 * The state for a form (composition of fields).
 */
export default class FormState<TFields extends ValidatableFields, TValue = ValueOfFields<TFields>> extends Disposable implements ComposibleValidatable<TFields, TValue> {

  /**
   * Behavior mode: `object` or `array`
   */
  private mode: 'object' | 'array' = 'object'

  /**
   * If activated (with auto validate).
   * Form will only be activated when `validate()` called or some field activated.
   */
  @observable _activated = false

  /**
   * If value has been touched.
   */
  @computed get dirty() {
    return this.fields.some(
      field => field.dirty
    )
  }

  /**
   * Fields.
   */
  @observable.ref $: TFields

  /**
   * List of fields.
   */
  @computed private get fields(): ComposibleValidatable<any>[] {
    if (this.mode === 'array') {
      return this.$ as FieldsArray
    }
    const fields = this.$ as FieldsObject
    return Object.keys(fields).map(
      key => fields[key]
    )
  }

  /**
   * Value that can be consumed by your code.
   * It's a composition of fields' value.
   */
  @computed get value(): TValue {
    if (this.mode === 'array') {
      return this.fields.map(
        field => field.value
      ) as any
    }
    const fields = this.$ as FieldsObject
    return Object.keys(fields).reduce(
      (value, key) => ({
        ...value,
        [key]: fields[key].value
      }),
      {}
    ) as any
  }

  /**
   * The validate status.
   */
  @observable _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  /**
   * If the state is doing a validation.
   */
  @computed get validating() {
    if (this.validationDisabled) {
      return false
    }
    return (
      this._validateStatus === ValidateStatus.Validating
      || this.fields.some(field => field.validating)
    )
  }

  /**
   * The error info of form validation (regardless of disableValidationWhen).
   */
  @observable private _error: Error

  /**
   * The error info of form validation.
   */
  @computed get ownError(): Error {
    if (this.validationDisabled) {
      return undefined
    }
    return this._error
  }

  /**
  * If the state contains form validation error.
  */
  @computed get hasOwnError() {
    return !!this.ownError
  }

  /**
   * The error info of validation (including fields' error info).
   */
  @computed get error() {
    if (this.validationDisabled) {
      return undefined
    }
    if (this._error) {
      return this._error
    }
    for (const field of this.fields) {
      if (field.error) {
        return field.error
      }
    }
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
    if (this.validationDisabled) {
      return false
    }
    return this._validateStatus === ValidateStatus.Validated && this.fields.every(
      field => field.validationDisabled || field.validated
    )
  }

  /**
   * Set error info of form.
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
   * 同步设置值
   * 这里 `FormState` 不提供 `set`，因为
   * 1. 如果 `set` 传入 fields（`$`），不够好用，意义不大
   * 2. 如果 `set` 传入 `value`，则 `FormState` 很难利用 `value` 还原 fields
   *    如 fields 是 `[field1, field2]`，传入 `value` 为 `[1, 2, 3]` 的情况，这里做不到依据 `3` 还原出其对应的 field
   */
  // @action private set(value: TValue) {}

  /**
   * Reset to initial status.
   */
  @action reset() {
    this._activated = false
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined

    this.fields.forEach(
      field => field.reset()
    )
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

    action('activate-when-validate', () => {
      this._activated = true
    })()

    this._validate()
    this.fields.forEach(
      field => field.validate()
    )

    // 兼容 formstate 接口
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

    // 如果 validation 已过期，则不生效
    if (validation !== this.validation) {
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

  constructor(initialFields: TFields) {
    super()

    makeObservable(this)

    this.mode = isArrayLike(initialFields) ? 'array' : 'object'
    this.$ = initialFields

    if (!isObservable(this.$)) {
      this.$ = observable(this.$, undefined, { deep: false })
    }

    // auto activate: any field activated -> form activated
    this.addDisposer(reaction(
      () => this.fields.some(field => field._activated),
      someFieldActivated => someFieldActivated && !this._activated && (this._activated = true),
      { fireImmediately: true }
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

    // dispose fields when dispose
    this.addDisposer(() => {
      this.fields.forEach(
        field => field.dispose()
      )
    })
  }

}
