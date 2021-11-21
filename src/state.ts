import { action, computed, makeObservable, observable, when } from 'mobx'
import { Error, IState, Validated, ValidateResult, ValidateStatus, Validator } from './types'
import Disposable from './disposable'
import { applyValidators } from './utils'

export abstract class StateUtils extends Disposable {

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

export default abstract class State<V> extends StateUtils implements IState<V> {

  abstract value: V
  abstract initialValue: V
  abstract activated: boolean
  abstract validate(): Promise<ValidateResult<V>>
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

  reset() {
    this.resetWith(this.initialValue)
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

  protected async getValidateResult(): Promise<ValidateResult<V>> {
    // Compatible with formstate
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

  /** Configure when to disable validation. */
  @action disableValidationWhen(predict: () => boolean) {
    this.shouldDisableValidation = predict
    return this
  }

  constructor() {
    super()
    makeObservable(this)
  }

}
