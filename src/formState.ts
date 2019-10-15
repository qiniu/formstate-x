import { observable, computed, isArrayLike, isObservable, action, autorun, runInAction, when, reaction } from 'mobx'
import { ComposibleValidatable, ValueOfFields, ValidationResponse, Validator, Validated, ValidateStatus } from './types'
import { applyValidators } from './utils'
import Disposable from './disposable'

/** Mode: object */
export type FieldsObject = { [key: string]: ComposibleValidatable<any> }
/** Mode: array */
export type FieldsArray = ComposibleValidatable<any>[]
/** Each key of the object is a validatable */
export type ValidatableFields = FieldsObject | FieldsArray


export default class FormState<TFields extends ValidatableFields, TValue = ValueOfFields<TFields>> extends Disposable implements ComposibleValidatable<TFields, TValue> {

  /**
   * 行为模式，区分内容为 object / array 的情况
   */
  private mode: 'object' | 'array' = 'object'

  /**
   * 是否激活（启用自动校验行为）
   */
  @computed get _activated() {
    return this.fields.some(
      field => field._activated
    )
  }

  /**
   * 值是否脏（不同于 initialValue）
   */
  @computed get dirty() {
    return this.fields.some(
      field => field.dirty
    )
  }

  /**
   * 子字段集合
   */
  @observable.ref $: TFields

  /**
   * 字段数组
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
   * 值（程序可消费），为所有子字段的 `value` 的组合值（Plain JavaScript Value）
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
   * 校验状态
   */
  @observable _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  /**
   * 是否校验中
   */
  @computed get validating() {
    if (this.shouldDisableValidation()) {
      return false
    }
    return (
      this._validateStatus === ValidateStatus.Validating
      || this.fields.some(field => field.validating)
    )
  }

  /**
   * 表单自身校验逻辑输出的错误
   */
  @observable private _error?: string

  /**
   * 校验逻辑输出的错误信息
   */
  @computed get error() {
    if (this.shouldDisableValidation()) {
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
   * 是否包含校验错误
   */
  @computed get hasError() {
    return !!this.error
  }

  /**
   * 校验行为是否完成（不意味着校验通过）
   */
  @computed get validated() {
    if (this.shouldDisableValidation()) {
      return false
    }
    return this._validateStatus === ValidateStatus.Validated && this.fields.every(
      field => field.validated
    )
  }

  /**
   * 设置错误信息
   */
  @action setError(error: ValidationResponse) {
    this._error = error ? error : undefined
  }

  /**
   * 校验函数列表
   */
  @observable.shallow private _validators: Validator<TValue>[] = []

  /**
   * 添加校验函数
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
   * 重置为初始状态
   */
  @action reset() {
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined

    this.fields.forEach(
      field => field.reset()
    )
  }

  /**
   * 当前正在进行的 validate 行为信息
   */
  @observable.ref private validation?: Validated<TValue>

  /**
   * 事实上的的校验行为
   */
  private _validate() {
    const value = this.value

    runInAction('set-validateStatus-when-_validate', () => {
      this._validateStatus = ValidateStatus.Validating
    })

    const response = applyValidators(value, this._validators)

    runInAction('set-validation-when-_validate', () => {
      this.validation = { value, response }
    })
  }

  /**
   * 执行校验
   */
  async validate() {
    this._validate()
    this.fields.forEach(
      field => field.validate()
    )

    // 兼容 formstate 接口
    await when(
      () => this.shouldDisableValidation() || this.validated,
      { name: 'return-validate-when-not-validating' }
    )

    return (
      this.hasError
      ? { hasError: true } as const
      : { hasError: false, value: this.value } as const
    )
  }

  /**
   * 是否应该禁用校验的检查函数
   */
  @observable.ref private shouldDisableValidation = () => false

  /**
   * 配置禁用校验的逻辑
   */
  @action disableValidationWhen(predict: () => boolean) {
    this.shouldDisableValidation = predict
    return this
  }

  /**
   * 让校验行为生效
   */
  private async applyValidation() {
    const validation = this.validation
    if (!validation) {
      return
    }

    const error = await validation.response

    if (
      validation !== this.validation // 如果 validation 已过期，则不生效
      || validation.value !== this.value // 如果 value 已过期，则不生效
    ) {
      return
    }

    runInAction('endValidation', () => {
      this.validation = undefined
      this._validateStatus = ValidateStatus.Validated

      if (error !== this.error) {
        this.setError(error)
      }
    })
  }

  constructor(initialFields: TFields) {
    super()

    this.mode = isArrayLike(initialFields) ? 'array' : 'object'
    this.$ = initialFields

    if (!isObservable(this.$)) {
      this.$ = observable(this.$, undefined, { deep: false })
    }

    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => !this.shouldDisableValidation() && this._activated && this._validate(),
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
