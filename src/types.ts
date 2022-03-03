import FieldState from './fieldState'
import FormState from './formState'

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

export type ValidateResultWithError = { hasError: true, error: Error }
export type ValidateResultWithValue<T> = { hasError: false, value: T }
export type ValidateResult<T> = ValidateResultWithError | ValidateResultWithValue<T>

/** Validatable object. */
export interface Validatable<T, TValue = T> {
  $: T
  value: TValue
  hasError: boolean
  error: Error
  validating: boolean
  validated: boolean
  validationDisabled: boolean
  validate(): Promise<ValidateResult<TValue>>
  validateResult: ValidateResult<TValue>
  // To see if there are requirements: enableAutoValidation, disableAutoValidation
  // enableAutoValidation: () => void
  // disableAutoValidation: () => void
}

/** Composible validatable object (which can be used as a field for `FormState`). */
export interface ComposibleValidatable<T, TValue = T> extends Validatable<T, TValue> {
  reset: () => void
  dispose: () => void
  dirty: boolean
  _activated: boolean
  _validateStatus: ValidateStatus
}

/** Function to do dispose. */
export interface Disposer {
  (): void
}

/** Value of `FieldState`. */
export type ValueOfFieldState<State> = (
  State extends FieldState<infer FieldType>
  ? FieldType
  : never
)

/** Value of object-fields. */
export type ValueOfObjectFields<Fields> = {
  [FieldKey in keyof Fields]: ValueOf<Fields[FieldKey]>
}

/** Value of array-fields. */
export type ValueOfArrayFields<Fields> = (
  Fields extends Array<infer Field>
  ? Array<ValueOf<Field>>
  : never
)

/** Value of fields. */
export type ValueOfFields<Fields> = (
  Fields extends { [key: string]: ComposibleValidatable<any> }
  ? ValueOfObjectFields<Fields>
  : ValueOfArrayFields<Fields>
)

/** Value of state (`FormState` or `FieldState`) */
export type ValueOf<State> = (
  State extends FormState<infer Fields>
  ? ValueOfFields<Fields>
  : (
    State extends FieldState<infer V>
    ? V
    : (
      State extends Validatable<unknown, infer V>
      ? V
      : never
    )
  )
)

/** Validate status. */
export enum ValidateStatus {
  /** (need validation but) not validated */
  NotValidated, // 尚未校验
  /** current validation ongoing */
  Validating, // 校验中
  /** current validation finished */
  Validated // 校验完成
}
