import { action, autorun, computed, makeObservable, observable, when } from 'mobx'
import { ValidationResult, IState, Validation, ValidateResult, ValidationError, ValidateStatus, Validator } from './types'
import Disposable from './disposable'
import { applyValidators, isPromiseLike, normalizeError } from './utils'

/** Extraction for some basic features of State */
export abstract class BaseState extends Disposable implements Pick<
  IState, 'rawError' | 'error' | 'ownError' | 'hasOwnError' | 'hasError' | 'validateStatus' | 'validating' | 'validated'
> {

  abstract rawError: ValidationResult

  abstract error: ValidationError

  @computed get hasError() {
    return !!this.error
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
   * The original validation result.
   */
  @observable protected validationResult: ValidationResult

  @computed get rawError() {
    return this.disabled ? undefined : this.validationResult
  }

  @computed get error() {
    return this.ownError
  }

  /**
   * Set validation result.
   */
  @action setError(error: ValidationResult) {
    this.validationResult = error
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

    if (!this.activated) {
      // activate 本身会触发自动的校验行为（见 `autorun-check-&-doValidation`）
      action('activate-when-validate', () => {
        this.activated = true
      })()
    } else {
      // 若未触发自动校验，这里调用之以确保进行了校验
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
    this.validationResult = undefined
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
