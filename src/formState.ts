import { observable, computed, isObservable, action, reaction, makeObservable, override } from 'mobx'
import { IState, ValidateStatus, Error, ValidateResult, ValueOfObjectFields } from './types'
import HasValue from './state'

export abstract class AbstractFormState<T, V> extends HasValue<V> implements IState<V> {

  /** Fields. */
  abstract readonly $: T

  /** List of fields. */
  protected abstract fieldList: IState[]

  @override override get validateStatus() {
    if (this.validationDisabled) {
      return ValidateStatus.WontValidate
    }
    const fieldList = this.fieldList.filter(
      field => field.validateStatus != ValidateStatus.WontValidate
    )
    if (
      this.rawValidateStatus === ValidateStatus.Validating
      || fieldList.some(field => field.validateStatus === ValidateStatus.Validating)
    ) {
      return ValidateStatus.Validating
    }
    if (
      this.rawValidateStatus === ValidateStatus.Validated
      && fieldList.every(field => field.validateStatus === ValidateStatus.Validated)
    ) {
      return ValidateStatus.Validated
    }
    return ValidateStatus.NotValidated
  }

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

  /** The error info of validation (including fields' error info). */
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

  /** If field list has been touched */
  @observable protected _dirty = false

  @computed get dirty() {
    return (
      this._dirty
      || this.fieldList.some(field => field.dirty)
    )
  }

  /** Reset fields */
  protected abstract resetFields(): void

  @action reset() {
    this.activated = false
    this.rawValidateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
    this._dirty = false

    this.resetFields()
  }

  override async validate(): Promise<ValidateResult<V>> {
    this.fieldList.forEach(
      field => field.validate()
    )

    return super.validate()
  }

  protected override init() {
    super.init()

    // auto activate: any field activated -> form activated
    this.addDisposer(reaction(
      () => this.fieldList.some(field => field.activated),
      someFieldActivated => someFieldActivated && !this.activated && (this.activated = true),
      { fireImmediately: true, name: 'activate-form-when-field-activated' }
    ))

    // dispose fields when dispose
    this.addDisposer(() => {
      this.fieldList.forEach(
        field => field.dispose()
      )
    })
  }

  constructor() {
    super()
    makeObservable(this)
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

  @computed protected get fieldList(): IState[] {
    const fields = this.$
    return Object.keys(fields).map(
      key => fields[key]
    )
  }

  protected resetFields() {
    this.fieldList.forEach(field => field.reset())
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
    makeObservable(this)

    if (!isObservable(initialFields)) {
      initialFields = observable(initialFields, undefined, { deep: false })
    }
    this.$ = initialFields

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
    this._dirty = true
  }

  private _insert(fromIndex: number, ...fieldValues: V[]) {
    const fields = fieldValues.map(this.createFieldState)
    this.fieldList.splice(fromIndex, 0, ...fields)
    this._dirty = true
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
    this._dirty = true
    this.activated = true
  }

  constructor(private initialValue: V[], private createFieldState: (v: V) => T) {
    super()
    makeObservable(this)

    this.fieldList = this.createFields(this.initialValue)
    this.init()
  }
}

export function isFormState<T = unknown, V = any>(state: IState<V>): state is AbstractFormState<T, V> {
  return state instanceof AbstractFormState
}
