import { observable, computed, action, reaction, autorun, runInAction, when } from 'mobx'
import { ComposibleValidatable, Validator, Validated, ValidationResponse, ValidateStatus } from './types'
import { applyValidators } from './utils'
import Disposable from './disposable'

export default class FieldState<TValue> extends Disposable implements ComposibleValidatable<TValue> {

  /**
   * 是否激活（自动 validate）
   */
  @observable _activated = false

  /**
   * 值是否脏（不同于 initialValue）
   */
  @computed get dirty() {
    return this.value !== this.initialValue
  }

  /**
   * 原始值，即时响应 `onChange` 的值，用于绑定界面输入组件
   */
  @observable.ref _value: TValue

  /**
   * 值（程序可消费），`_value` debounce（默认 200ms）后同步到 `value`
   */
  @observable.ref value: TValue

  /**
   * 校验通过的安全值
   */
  @observable.ref $: TValue

  /**
   * 将原始值（`_value`）同步到值（`value`）
   */
  @action private applyValue() {
    this._activated = true
    this.value = this._value
  }

  /**
   * 校验状态
   */
  @observable _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  /**
   * 是否校验中
   */
  @computed get validating() {
    return this.shouldDisableValidation() ? false : this._validateStatus === ValidateStatus.Validating
  }

  /**
   * 校验逻辑输出的原始错误信息
   */
  @observable _error?: string

  /**
   * 校验逻辑输出的错误信息
   */
  @computed get error() {
    return this.shouldDisableValidation() ? undefined : this._error
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
    return this.shouldDisableValidation() ? false : this._validateStatus === ValidateStatus.Validated
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
   * 设置 `_value`
   */
  @action private setValue(value: TValue) {
    this._value = value
    this._validateStatus = ValidateStatus.NotValidated
  }

  /**
   * 响应值的变更并修改（`_value`）
   */
  @action onChange(value: TValue) {
    this.setValue(value)
  }

  /**
   * 同步设置值
   */
  @action set(value: TValue) {
    this.setValue(value)
    this.value = this._value // 不使用 applyValue，避免 activate
  }

  /**
   * 重置为初始状态
   */
  @action reset() {
    this.$ = this.value = this._value = this.initialValue
    this._activated = false
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
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
    // 如果 value 已经过期，则不处理
    if (value !== this._value) {
      return
    }

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
    runInAction('activate-when-validate', () => {
      this._activated = true
    })

    this.applyValue()

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
      || validation.value !== this._value // 如果 value 已过期，则不生效
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

  constructor(private initialValue: TValue, delay = 200) {
    super()

    this.reset()

    // debounced auto sync: this._value -> this.value
    this.addDisposer(reaction(
      () => this._value,
      () => this.applyValue(),
      { delay, name: 'applyValue-when-value-change' }
    ))

    // auto sync while validated: this.value -> this.$
    this.addDisposer(reaction(
      () => this.validated && !this.hasError,
      validateOk => validateOk && (this.$ = this.value),
      { name: 'sync-$-when-validatedOk' }
    ))

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
  }
}
