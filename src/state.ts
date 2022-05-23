import { action, autorun, computed, makeObservable, observable, when } from 'mobx'
import { ValidationResult, IState, Validation, ValidateResult, ValidateStatus, Validator } from './types'
import Disposable from './disposable'
import { applyValidators, isPromiseLike, isPassed, normalizeError } from './utils'

/** Extraction for some basic features of State */
export abstract class BaseState extends Disposable implements Pick<
  IState, 'rawError' | 'ownError' | 'hasOwnError' | 'hasError' | 'validateStatus' | 'validating' | 'validated'
> {

  abstract rawError: ValidationResult

  @computed get hasError() {
    return !isPassed(this.rawError)
  }

  @computed get ownError() {
    return normalizeError(this.rawError)
  }

  @computed get hasOwnError() {
    return !!this.ownError
  }

  abstract validateStatus: ValidateStatus

  @computed get validating() {
    return this.validateStatus === ValidateStatus.Validating
  }

  @computed get validated() {
    return this.validateStatus === ValidateStatus.Validated
  }

  constructor() {
    super()
    makeObservable(this)
  }
}

/** Extraction for State's validating logic */
export abstract class ValidatableState<V> extends BaseState implements IState<V> {

  abstract value: V
  abstract touched: boolean
  abstract onChange(value: V): void
  abstract set(value: V): void

  /** The original validate status (regardless of `validationDisabled`) */
  @observable protected _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  @computed get validateStatus() {
    return this.disabled ? ValidateStatus.WontValidate : this._validateStatus
  }

  @observable activated = false

  /**
   * The original return value of validation.
   */
  @observable private _error: ValidationResult

  @computed get rawError() {
    return this.disabled ? undefined : this._error
  }

  @computed get error() {
    return this.ownError
  }

  /**
   * Set validation result.
   */
  @action setError(error: ValidationResult) {
    this._error = error
  }

  /** List of validator functions. */
  @observable.shallow private validatorList: Validator<V>[] = []

  @action withValidator(...validators: Validator<V>[]) {
    this.validatorList.push(...validators)
    return this
  }

  /** Current validation info. */
  protected validation?: Validation<V>

  /** Do validation: run validators & apply result. */
  protected async doValidation() {
    action('start-validation', () => {
      this._validateStatus = ValidateStatus.Validating
    })()

    // create validation by running validators
    const value = this.value
    const returned = applyValidators(value, this.validatorList)
    const validation = this.validation = { value, returned }

    // read validation result (there may be async validators)
    const result = isPromiseLike(returned) ? await returned : returned

    // if validation outdated, just drop it
    if (this.validation !== validation) return

    action('end-validation', () => {
      this.validation = undefined
      this._validateStatus = ValidateStatus.Validated
      this.setError(result)
    })()
  }

  @computed protected get validateResult(): ValidateResult<V> {
    return (
      this.hasError
      ? { hasError: true, error: this.error! } as const
      : { hasError: false, value: this.value } as const
    )
  }

  async validate(): Promise<ValidateResult<V>> {
    if (this.disabled) {
      return this.validateResult
    }

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
      () => this.disabled || this.validated,
      { name: 'return-validate-when-not-validating' }
    )

    return this.validateResult
  }

  /** Fn predicts if state should be disabled. */
  @observable.ref private shouldDisable = () => false

  /**
   * If state is disabled, which means:
   * - corresponding UI is invisible or disabled
   * - state value do not need to (and will not) be validated
   * - state `onChange` will not be called
   * - no error info will be provided
   */
  @computed protected get disabled() {
    return this.shouldDisable()
  }

  @action disableWhen(predictFn: () => boolean) {
    this.shouldDisable = predictFn
    return this
  }

  @action reset() {
    this.activated = false
    this._validateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
  }

  protected init() {
    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => {
        if (this.disabled || !this.activated) return
        this.doValidation()
      },
      { name: 'autorun-check-&-doValidation' }
    ))
  }

  constructor() {
    super()
    makeObservable(this)
  }

}
