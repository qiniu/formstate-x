import { action, autorun, computed, makeObservable, observable, reaction, when } from 'mobx'
import { Error, IState, Validated, ValidateResult, ValidateStatus, ValidationResponse, Validator } from './types'
import Disposable from './disposable'
import { applyValidators, isPromiseLike } from './utils'

export abstract class HasErrorAndValidateStatus extends Disposable {

  /** The error info of validation */
  abstract error: Error

  
  /** If the state contains error. */
  @computed get hasError() {
    return !!this.error
  }

  abstract validateStatus: ValidateStatus

  /** If the state is doing a validation. */
  @computed get validating() {
    return this.validateStatus === ValidateStatus.Validating
  }

  /**
   * If the validation has been done.
   * It does not mean validation passed.
   */
  @computed get validated() {
    return this.validateStatus === ValidateStatus.Validated
  }

  constructor() {
    super()
    makeObservable(this)
  }
}

export default abstract class HasValueAndValidators<V> extends HasErrorAndValidateStatus implements IState<V> {

  abstract value: V
  abstract initialValue: V
  abstract set(value: V): void
  abstract onChange(value: V): void
  abstract resetWith(initialValue: V): void
  abstract dirtyWith(initialValue: V): boolean

  @computed get dirty() {
    return this.dirtyWith(this.initialValue)
  }

  /** The raw validate status (regardless of `validationDisabled`) */
  @observable protected rawValidateStatus: ValidateStatus = ValidateStatus.NotValidated

  /** Current validate status. */
  @computed get validateStatus() {
    return this.validationDisabled ? ValidateStatus.NotValidated : this.rawValidateStatus
  }

  @observable activated = false

  reset() {
    this.resetWith(this.initialValue)
  }

  /**
   * The original error info of validation.
   */
  @observable protected _error: Error

  /**
   * Set error info.
   */
  @action setError(error: ValidationResponse) {
    this._error = error ? error : undefined
  }

  /** List of validator functions. */
  @observable.shallow private validatorList: Validator<V>[] = []

  /** Add validator function. */
  @action validators(...validators: Validator<V>[]) {
    this.validatorList.push(...validators)
    return this
  }

  /** Current validation info. */
  @observable.ref protected validation?: Validated<V>

  /** Do validation. */
  protected doValidation() {
    const value = this.value

    action('set-validateStatus-when-doValidation', () => {
      this.rawValidateStatus = ValidateStatus.Validating
    })()

    const response = applyValidators(value, this.validatorList)

    action('set-validation-when-doValidation', () => {
      this.validation = { value, response }
    })()
  }

  /**
   * Apply validation.
   */
  protected async applyValidation() {
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

  async validate(): Promise<ValidateResult<V>> {
    const validation = this.validation

    action('activate-when-validate', () => {
      this.activated = true
    })()

    // 若 `validation` 未发生变更，意味着未发生新的校验行为
    // 若上边操作未触发自动的校验行为，强制调用之
    if (this.validation === validation) {
      this.doValidation()
    }

    await when(
      () => this.validationDisabled || this.validated,
      { name: 'return-validate-when-not-validating' }
    )

    return (
      this.error
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

  /** Configure when to disable validation. */
  @action disableValidationWhen(predict: () => boolean) {
    this.shouldDisableValidation = predict
    return this
  }

  protected init() {
    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => {
        if (this.validationDisabled || !this.activated) return
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

  constructor() {
    super()
    makeObservable(this)
  }

}
