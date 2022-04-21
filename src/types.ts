/** Result of validation. */
export type ValidationResult =
  string
  | null
  | undefined
  | false

/** Return value of validator. */
export type ValidatorReturned = 
  ValidationResult
  | Promise<ValidationResult>

/** A validator checks if given value is valid. **/
export type Validator<T> = (value: T) => ValidatorReturned

export type Validation<TValue> = {
  value: TValue // value for the validation
  returned: ValidatorReturned // result of applying validators
}

export type ValidationError = string | undefined

export type ValidateResultWithError = { hasError: true, error: NonNullable<ValidationError> }
export type ValidateResultWithValue<T> = { hasError: false, value: T }
export type ValidateResult<T> = ValidateResultWithError | ValidateResultWithValue<T>

/** interface for State */
export interface IState<Value = unknown, SafeValue extends Value = Value> {
  /** Value in the state. */
  value: Value
  safeValue: SafeValue
  /** If value has been touched. */
  touched: boolean
  /** The error info of validation. */
  error: ValidationError
  /** If the state contains error. */
  hasError: boolean
  /** The state's own error info, regardless of child states. */
  ownError: ValidationError
  /** If the state contains its own error info. */
  hasOwnError: boolean
  /** If activated (with auto-validation). */
  activated: boolean
  /** Current validate status. */
  validateStatus: ValidateStatus
  /** If the state is doing a validation. */
  validating: boolean
  /**
   * If the validation has been done.
   * It does not mean validation passed.
   */
  validated: boolean
  /** Fire a validation behavior. */
  validate(): Promise<ValidateResult<this['safeValue']>>
  /** Set `value` on change event. */
  onChange(value: Value): void
  /** Set `value` imperatively. */
  set(value: Value): void
  /** Reset to initial status. */
  reset(): void
  /** Append validator(s). */
  withValidator<NSV = SafeValue>(...validators: Array<Validator<Value>>): (this & { safeValue: NSV })
  /**
   * Configure when state should be disabled, which means:
   * - corresponding UI is invisible or disabled
   * - state value do not need to (and will not) be validated
   * - state `onChange` will not be called
   * - no error info will be provided
   */
  disableWhen(predictFn: () => boolean): this
  /** Do dispose */
  dispose(): void
}

/** Safe Value of `IState` */
export type SafeValueOf<S> = S extends IState ? S['safeValue'] : never

/** Function to do dispose. */
export interface Disposer {
  (): void
}

/** Value of states object. */
export type ValueOfStatesObject<StatesObject> = {
  [K in keyof StatesObject]: ValueOf<StatesObject[K]>
}

/** Safe Value of states object. */
export type SafeValueOfStatesObject<StatesObject> = {
  [K in keyof StatesObject]: SafeValueOf<StatesObject[K]>
}

/** Value of `IState` */
export type ValueOf<S> = S extends IState<infer V> ? V : never

/** Validate status. */
export enum ValidateStatus {
  /** (need validation but) not validated */
  NotValidated,
  /** current validation ongoing */
  Validating,
  /** current validation finished */
  Validated,
  /** do not need to validate */
  WontValidate
}
