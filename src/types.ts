import { FieldState } from './fieldState'

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
  /** If value has been touched */
  dirty: boolean
  /** The error info of validation */
  error: Error
  /** If activated (with auto-validation). */
  activated: boolean
  /** Current validate status. */
  validateStatus: ValidateStatus
  /** Fire a validation behavior. */
  validate(): Promise<ValidateResult<V>>
  /** Set `value` on change event. */
  onChange(value: V): void
  /** Set `value` imperatively. */
  set(value: V): void
  /** Reset to initial status. */
  reset(): void
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
  Validated, // 校验完成
  /** do not need to validate */
  WontValidate // 无须校验
}
