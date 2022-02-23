/** A truthy string or falsy values. */
export type ValidationResponse =
  string
  | null
  | undefined
  | false

/** The return value of a validator. */
export type ValidatorResponse = 
  ValidationResponse
  | Promise<ValidationResponse>

export type Validation<TValue> = {
  value: TValue // value for the response
  response: ValidatorResponse // response for the value
}

/**
 * A validator simply takes a value and returns a string or Promise<string>
 * If a truthy string is returned it represents a validation error
 **/
export interface Validator<TValue> {
  (value: TValue): ValidatorResponse
}

export type Error = string | undefined

export type ValidateResultWithError = { hasError: true, error: NonNullable<Error> }
export type ValidateResultWithValue<T> = { hasError: false, value: T }
export type ValidateResult<T> = ValidateResultWithError | ValidateResultWithValue<T>

/** interface for State */
export interface IState<V = unknown> {
  /** Value in the state. */
  value: V
  /** If value has been touched. */
  dirty: boolean
  /** The error info of validation. */
  error: Error
  /** If the state contains error. */
  hasError: boolean
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
  validate(): Promise<ValidateResult<V>>
  /** Set `value` on change event. */
  onChange(value: V): void
  /** Set `value` imperatively. */
  set(value: V): void
  /** Reset to initial status. */
  reset(): void
  /** Append validator(s). */
  withValidator(...validators: Array<Validator<V>>): this
  /**
   * Configure when state will be disabled, which means:
   * - corresponding UI is invisible or disabled
   * - state value do not need to (and will not) be validated
   * - state `onChange` will not be called
   * - no error info will be provided
   */
  disableWhen(predictFn: () => boolean): this
  /** Do dispose */
  dispose(): void
}

/** Function to do dispose. */
export interface Disposer {
  (): void
}

/** Value of states object. */
export type ValueOfStatesObject<StatesObject> = {
  [K in keyof StatesObject]: ValueOf<StatesObject[K]>
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
