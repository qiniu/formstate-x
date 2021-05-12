import { observable, computed, isObservable, action, autorun, when, reaction, makeObservable } from 'mobx'
import { Validatable, ValidationResponse, Validator, Validated, ValidateStatus, Error, ValidateResult, ValueOfObjectFields } from './types'
import { applyValidators, isPromiseLike } from './utils'
import Disposable from './disposable'

export abstract class AbstractFormState<T, TValue> extends Disposable implements Validatable<T, TValue> {

  /**
   * If activated (with auto validate).
   * Form will only be activated when `validate()` called or some field activated.
   */
  @observable _activated = false

  /**
   * Fields.
   */
  declare abstract readonly $: T

  /**
  * If value is different with given initial value.
  */
  abstract _dirtyWith(initialValue: TValue): boolean

  /**
  * If value has been touched (different with initial value).
  */
  declare abstract dirty: boolean

  /**
   * List of fields.
   */
  declare protected abstract fieldList: Validatable[]

  /**
   * Value that can be consumed by your code.
   * It's a composition of fields' value.
   */
  declare abstract value: TValue

  /**
   * Set form value synchronously.
   */
  abstract set(value: TValue): void

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
      || this.fieldList.some(field => field.validating)
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
    for (const field of this.fieldList) {
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
   * If the validation has been done.
   * It does not means validation passed.
   */
  @computed get validated() {
    if (this.validationDisabled) {
      return false
    }
    return this._validateStatus === ValidateStatus.Validated && this.fieldList.every(
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

  protected abstract declare initialValue: TValue

  /**
   * Reset fields
   */
  protected abstract resetFields(initialValue: TValue): void

  /**
   * Reset to intial status with specific value.
   */
  @action resetWith(initialValue: TValue) {
    this._activated = false
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
    this.initialValue = initialValue

    this.resetFields(initialValue)
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
    action('activate-when-validate', () => {
      this._activated = true
    })()

    this._validate()
    this.fieldList.forEach(
      field => field.validate()
    )

    // 兼容 formstate 接口
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

  protected init() {
    makeObservable(this)

    // auto activate: any field activated -> form activated
    this.addDisposer(reaction(
      () => this.fieldList.some(field => field._activated),
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
      this.fieldList.forEach(
        field => field.dispose()
      )
    })
  }
}

/** Object with validatable fields */
export type FieldsObject = { [key: string]: Validatable }

/**
 * The state for a form (composition of fields).
 */
export class FormState<
  TFields extends FieldsObject
> extends AbstractFormState<
  TFields, ValueOfObjectFields<TFields>
> {

  @observable.ref readonly $: TFields

  protected initialValue: ValueOfObjectFields<TFields>

  _dirtyWith(initialValue: ValueOfObjectFields<TFields>) {
    return Object.keys(this.$).some(
      key => this.$[key]._dirtyWith(initialValue[key])
    )
  }

  @computed get dirty() {
    return this._dirtyWith(this.initialValue)
  }

  @computed protected get fieldList(): Validatable[] {
    const fields = this.$
    return Object.keys(fields).map(
      key => fields[key]
    )
  }

  protected resetFields() {
    const fields = this.$
    const initialValue = this.initialValue
    Object.keys(fields).forEach(key => {
      fields[key].resetWith(initialValue[key])
    })
  }

  @computed get value(): ValueOfObjectFields<TFields> {
    const fields = this.$
    return Object.keys(fields).reduce(
      (value, key) => ({
        ...value,
        [key]: fields[key].value
      }),
      {}
    ) as any
  }

  @action set(value: ValueOfObjectFields<TFields>) {
    const fields = this.$
    Object.keys(fields).forEach(key => {
      fields[key].set(value[key])
    })
  }

  constructor(initialFields: TFields) {
    super()

    this.$ = initialFields
    this.initialValue = this.value

    if (!isObservable(this.$)) {
      this.$ = observable(this.$, undefined, { deep: false })
    }

    this.init()
  }
}

/**
 * The state for a array form (list of fields).
 */
export class ArrayFormState<
  V, T extends Validatable<any, V> = Validatable<any, V>
> extends AbstractFormState<
  T[], V[]
> {

  @observable.ref readonly $: T[]

  _dirtyWith(initialValue: V[]) {
    return (
      this.$.length !== initialValue.length
      || this.$.some((field, i) => field._dirtyWith(initialValue[i]))
    )
  }

  @computed get dirty() {
    return this._dirtyWith(this.initialValue)
  }

  @computed protected get fieldList(): T[] {
    return this.$
  }

  private createFields(value: V[]): T[] {
    return observable(
      value.map(this.createFieldState),
      undefined,
      { deep: false }
    )
  }

  @action protected resetFields() {
    this.$.splice(0).forEach(field => {
      field.dispose()
    })
    this.$.push(...this.createFields(this.initialValue))
  }

  @computed get value(): V[] {
    return this.fieldList.map(
      field => field.value
    ) as any
  }

  @action set(value: V[]) {
    let i = 0
    // index exists in both value & fields => set
    for (; i < value.length && i < this.$.length; i++) {
      this.$[i].set(value[i])
    }
    // index only exists in value => append
    for (; i < value.length; i++) {
      this.$.push(this.createFieldState(value[i]))
    }
    // index only exists in fields => truncate
    if (i < this.$.length) {
      this.$.splice(i).forEach(field => {
        field.dispose()
      })
    }
  }

  constructor(protected initialValue: V[], private createFieldState: (v: V) => T) {
    super()

    this.$ = this.createFields(this.initialValue)
    this.init()
  }
}

export function isFormState<T, V>(state: Validatable<T, V>): state is AbstractFormState<T, V> {
  return state instanceof AbstractFormState
}
