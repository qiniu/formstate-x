import { action, autorun, computed, makeObservable, observable, when } from 'mobx'
import { ValidationError, IState, Validation, ValidateResult, ValidateStatus, Validator } from './types'
import Disposable from './disposable'
import { applyValidators, isValid, isPromiseLike } from './utils'

/** Extraction for some basic features of State */
export abstract class BaseState extends Disposable implements Pick<
  IState, 'ownError' | 'hasOwnError' | 'error' | 'hasError' | 'validateStatus' | 'validating' | 'validated'
> {

  abstract error: ValidationError

  @computed get hasError() {
    return !!this.error
  }

  abstract ownError: ValidationError

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
export abstract class ValidatableState<V, SV extends V> extends BaseState implements IState<V, SV> {

  abstract value: V
  abstract touched: boolean
  abstract onChange(value: V): void
  abstract set(value: V): void

  @computed get safeValue(): SV {
    if (!this.validated || this.hasError) throw new Error('TODO')
    return this.value as SV
  }

  /** The original validate status (regardless of `validationDisabled`) */
  @observable protected _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  @computed get validateStatus() {
    return this.disabled ? ValidateStatus.WontValidate : this._validateStatus
  }

  @observable activated = false

  /**
   * The original error info of validation.
   */
  @observable protected _error: ValidationError

  @computed get ownError() {
    return this.disabled ? undefined : this._error
  }

  @computed get error() {
    return this.ownError
  }

  /**
   * Set error info.
   */
  @action setError(error: ValidationError) {
    this._error = error
  }

  /** List of validator functions. */
  @observable.shallow private validatorList: Validator<V>[] = []

  @action withValidator<NSV = this['safeValue']>(...validators: Validator<V>[]): (this & { safeValue: NSV }) {
    this.validatorList.push(...validators)
    return this as (this & { safeValue: NSV })
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
      this.setError(isValid(result) ? undefined : result)
    })()
  }

  @computed protected get validateResult(): ValidateResult<SV> {
    return (
      this.error
      ? { hasError: true, error: this.error }
      : { hasError: false, value: this.value as SV }
    )
  }

  async validate(): Promise<ValidateResult<SV>> {
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
