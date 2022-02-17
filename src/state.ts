import { action, autorun, computed, makeObservable, observable, reaction, when } from 'mobx'
import { Error, IState, Validated, ValidateResult, ValidateStatus, ValidationResponse, Validator } from './types'
import Disposable from './disposable'
import { applyValidators, isPromiseLike } from './utils'

/** Extraction for some basic features of State */
export abstract class BaseState extends Disposable implements Pick<
  IState, 'error' | 'hasError' | 'validateStatus' | 'validating' | 'validated'
> {

  abstract error: Error

  @computed get hasError() {
    return !!this.error
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
  abstract dirty: boolean
  abstract onChange(value: V): void
  abstract set(value: V): void
  abstract reset(): void

  /** The original validate status (regardless of `validationDisabled`) */
  @observable protected _validateStatus: ValidateStatus = ValidateStatus.NotValidated

  @computed get validateStatus() {
    return this.disabled ? ValidateStatus.WontValidate : this._validateStatus
  }

  @observable activated = false

  /**
   * The original error info of validation.
   */
  @observable protected _error: Error

  @computed get error() {
    return this.disabled ? undefined : this._error
  }

  /**
   * Set error info.
   */
  @action setError(error: ValidationResponse) {
    this._error = error ? error : undefined
  }

  /** List of validator functions. */
  @observable.shallow private validatorList: Validator<V>[] = []

  /** Add validator function. */
  @action addValidator(...validators: Validator<V>[]) {
    this.validatorList.push(...validators)
    return this
  }

  /** Current validation info. */
  @observable.ref protected validation?: Validated<V>

  /** Do validation. */
  protected doValidation() {
    const value = this.value

    action('set-validateStatus-when-doValidation', () => {
      this._validateStatus = ValidateStatus.Validating
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
      this._validateStatus = ValidateStatus.Validated

      if (error !== this.error) {
        this.setError(error)
      }
    })()
  }

  @computed protected get validateResult(): ValidateResult<V> {
    return (
      this.error
      ? { hasError: true, error: this.error } as const
      : { hasError: false, value: this.value } as const
    )
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

  protected init() {
    // auto validate: this.value -> this.validation
    this.addDisposer(autorun(
      () => {
        if (this.disabled || !this.activated) return
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
