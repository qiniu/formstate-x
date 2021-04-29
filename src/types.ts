import FieldState from './fieldState'
import { AbstractFormState } from './formState'

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

/** Validatable object (which can be used as a field for `FormState`). */
export interface Validatable<T, TValue = T> {
  $: T
  value: TValue
  hasError: boolean
  error: Error
  validating: boolean
  validated: boolean
  validationDisabled: boolean
  dirty: boolean
  _activated: boolean
  _validateStatus: ValidateStatus

  validate(): Promise<ValidateResult<TValue>>
  set: (value: TValue) => void
  reset: () => void
  resetWith: (initialValue: TValue) => void
  _dirtyWith: (initialValue: TValue) => void
  dispose: () => void

  // To see if there are requirements: enableAutoValidation, disableAutoValidation
  // enableAutoValidation: () => void
  // disableAutoValidation: () => void
}

/** @deprecated Composible validatable object (which can be used as a field for `FormState`). */
export interface ComposibleValidatable<T, TValue = T> extends Validatable<T, TValue> {}

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
export type ValueOf<State> = (
  State extends AbstractFormState<infer TValue>
  ? TValue
  : ValueOfFieldState<State>
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
