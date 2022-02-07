import FieldState from './fieldState'

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

export type Validated<TValue> = {
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
export interface IState<V = any> {
  /** Value in the state. */
  value: V
  /** Initial value */
  initialValue: V
  /** The error info of validation */
  error: Error
  /** If validation disabled. TODO: disable or disable validation? */
  validationDisabled: boolean
  /** If value has been touched (different with `initialValue`) */
  dirty: boolean
  /** If activated (with auto validate). */
  activated: boolean
  /** Current validate status. */
  validateStatus: ValidateStatus
  /** Fire a validation behavior. */
  validate(): Promise<ValidateResult<V>>
  /** Set `value` imperatively. */
  set(value: V): void
  /** Handler for change event. */
  onChange(value: V): void
  /** Reset to initial status. */
  reset(): void
  /** Reset with specific intial value. */
  resetWith(initialValue: V): void
  /** Check if dirty with given initial value */
  dirtyWith(initialValue: V): boolean
  /** Add validator function. */
  validators(...validators: Array<Validator<V>>): this
  /** Configure when to disable validation. */
  disableValidationWhen(predict: () => boolean): this
  /** Do dispose */
  dispose(): void
}

/** Function to do dispose. */
export interface Disposer {
  (): void
}

/** Value of `FieldState`. */
export type ValueOfFieldState<State> = (
  State extends FieldState<infer TValue>
  ? TValue
  : never
)

/** Value of object-fields. */
export type ValueOfObjectFields<Fields> = {
  [FieldKey in keyof Fields]: ValueOf<Fields[FieldKey]>
}

/** Value of state (`FormState` or `FieldState`) */
export type ValueOf<S> = S extends IState<infer V> ? V : never

/** Validate status. */
export enum ValidateStatus {
  /** (need validation but) not validated */
  NotValidated, // 尚未校验
  /** current validation ongoing */
  Validating, // 校验中
  /** current validation finished */
  Validated // 校验完成
}
