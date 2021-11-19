import { observable, computed, isObservable, action, autorun, when, reaction, makeObservable, override } from 'mobx'
import { IState, ValidationResponse, Validator, Validated, ValidateStatus, Error, ValidateResult, ValueOfObjectFields } from './types'
import { applyValidators, isPromiseLike } from './utils'
import Disposable from './disposable'
import State from './state'

export abstract class AbstractFormState<T, V> extends State<V> implements IState<V> {

  /**
   * If activated (with auto validate).
   * Form will only be activated when `validate()` called or some field activated.
   */
  @observable activated = false

  /** Fields. */
  declare abstract readonly $: T

  /** List of fields. */
  declare protected abstract fieldList: IState[]

  /**
   * Value that can be consumed by your code.
   * It's a composition of fields' value.
   */
  declare abstract value: V

  // /** The validate status of form validation */
  // @observable protected rawValidateStatus: ValidateStatus = ValidateStatus.NotValidated

  @override get validateStatus() {
    if (this.validationDisabled) {
      return ValidateStatus.NotValidated
    }
    const fieldList = this.fieldList.filter(field => !field.validationDisabled)
    if (
      this.rawValidateStatus === ValidateStatus.NotValidated
      && fieldList.every(field => field.validateStatus === ValidateStatus.NotValidated)
    ) {
      return ValidateStatus.NotValidated
    }
    if (
      this.validateStatus === ValidateStatus.Validated
      && fieldList.every(field => field.validateStatus === ValidateStatus.Validated)
    ) {
      return ValidateStatus.Validated
    }
    return ValidateStatus.Validating
  }

  /**
   * The error info of form validation (regardless of disableValidationWhen).
   */
  @observable private _error: Error

  /** The error info of form validation. */
  @computed get ownError(): Error {
    if (this.validationDisabled) {
      return undefined
    }
    return this._error
  }

  /** If the state contains form validation error. */
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

  /** Set error info of form. */
  @action setError(error: ValidationResponse) {
    this._error = error ? error : undefined
  }

  abstract declare initialValue: V

  /** Reset fields */
  protected abstract resetFields(initialValue: V): void

  @action resetWith(initialValue: V) {
    this.activated = false
    this.rawValidateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
    this.initialValue = initialValue

    this.resetFields(initialValue)
  }

  /**
   * Fire a validation behavior.
   */
  async validate(): Promise<ValidateResult<V>> {
    action('activate-when-validate', () => {
      this.activated = true
    })()

    this.doValidation()
    this.fieldList.forEach(
      field => field.validate()
    )

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

    // 如果 validation 已过期，则不生效
    if (validation !== this.validation) {
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

  protected init() {
    makeObservable(this)

    // auto activate: any field activated -> form activated
    this.addDisposer(reaction(
      () => this.fieldList.some(field => field.activated),
      someFieldActivated => someFieldActivated && !this.activated && (this.activated = true),
      { fireImmediately: true }
    ))

    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => !this.validationDisabled && this.activated && this.doValidation(),
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
export type FieldsObject = { [key: string]: IState }

/**
 * The state for a form (composition of fields).
 */
export class FormState<
  TFields extends FieldsObject
> extends AbstractFormState<
  TFields, ValueOfObjectFields<TFields>
> {

  @observable.ref readonly $: Readonly<TFields>

  initialValue: ValueOfObjectFields<TFields>

  dirtyWith(initialValue: ValueOfObjectFields<TFields>) {
    return Object.keys(this.$).some(
      key => this.$[key].dirtyWith(initialValue[key])
    )
  }

  @computed protected get fieldList(): IState[] {
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

  @action onChange(value: ValueOfObjectFields<TFields>) {
    const fields = this.$
    Object.keys(fields).forEach(key => {
      fields[key].onChange(value[key])
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
  V, T extends IState<V> = IState<V>
> extends AbstractFormState<
  readonly T[], V[]
> {

  @observable.ref protected fieldList: T[]

  @computed get $(): readonly T[] {
    return this.fieldList
  }

  dirtyWith(initialValue: V[]) {
    return (
      this.$.length !== initialValue.length
      || this.$.some((field, i) => field.dirtyWith(initialValue[i]))
    )
  }

  private createFields(value: V[]): T[] {
    return observable(
      value.map(this.createFieldState),
      undefined,
      { deep: false }
    )
  }

  @action protected resetFields() {
    const fields = this.fieldList
    fields.splice(0).forEach(field => {
      field.dispose()
    })
    fields.push(...this.createFields(this.initialValue))
  }

  @computed get value(): V[] {
    return this.fieldList.map(
      field => field.value
    )
  }

  private _remove(fromIndex: number, num: number) {
    this.fieldList.splice(fromIndex, num).forEach(field => {
      field.dispose()
    })
  }

  private _insert(fromIndex: number, ...fieldValues: V[]) {
    const fields = fieldValues.map(this.createFieldState)
    this.fieldList.splice(fromIndex, 0, ...fields)
  }

  private _set(value: V[], withOnChange = false) {
    let i = 0
    // items exists in both value & fields => do field change 
    for (; i < value.length && i < this.fieldList.length; i++) {
      if (withOnChange) this.fieldList[i].onChange(value[i])
      else this.fieldList[i].set(value[i])
    }
    // items only exists in fields => truncate
    if (i < this.fieldList.length) {
      this._remove(i, this.fieldList.length - i)
    }
    // items exists in value but not in fields => add
    if (i < value.length) {
      this._insert(i, ...value.slice(i))
    }
  }

  @action set(value: V[]) {
    this._set(value)
  }

  @action onChange(value: V[]) {
    this._set(value, true)
    this.activated = true
  }
  
  /**
   * remove fields
   * @param fromIndex index of first field to remove
   * @param num number of fields to remove
   */
  @action remove(fromIndex: number, num = 1) {
    if (num <= 0) return
    this._remove(fromIndex, num)
    this.activated = true
  }

  /**
   * insert fields
   * @param fromIndex index of first field to insert
   * @param ...fieldValues field values to insert
   */
  @action insert(fromIndex: number, fieldValue: V, ...moreFieldValues: V[]) {
    this._insert(fromIndex, fieldValue, ...moreFieldValues)
    this.activated = true
  }

  /**
   * append fields to the end of field list
   * @param ...fieldValues field values to append
   */
  @action append(fieldValue: V, ...moreFieldValues: V[]) {
    this._insert(this.fieldList.length, fieldValue, ...moreFieldValues)
    this.activated = true
  }

  /**
   * move field from one index to another
   * @param fromIndex index of field to move
   * @param toIndex index to move to
   */
  @action move(fromIndex: number, toIndex: number) {
    if (fromIndex < 0) fromIndex = this.fieldList.length + fromIndex
    if (toIndex < 0) toIndex = this.fieldList.length + toIndex
    if (fromIndex === toIndex) return

    const [item] = this.fieldList.splice(fromIndex, 1)
    this.fieldList.splice(toIndex, 0, item)
    this.activated = true
  }

  constructor(public initialValue: V[], private createFieldState: (v: V) => T) {
    super()

    this.fieldList = this.createFields(this.initialValue)
    this.init()
  }
}

export function isFormState<T = unknown, V = any>(state: IState<V>): state is AbstractFormState<T, V> {
  return state instanceof AbstractFormState
}
