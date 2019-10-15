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

/** Validatable object. */
export interface Validatable<T, TValue = T> {
  $: T
  value: TValue
  hasError: boolean
  error?: string | null | undefined
  validating: boolean
  validated: boolean
  validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }>

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

/** Value Array of given Field. */
// workaround for recursive type reference: https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
// not needed for typescript@3.7+: https://github.com/microsoft/TypeScript/pull/33050
export interface ValueArrayOf<Field> extends Array<ValueOf<Field>> {}

/** Value of object-fields. */
export type ValueOfObjectFields<Fields> = {
  [FieldKey in keyof Fields]: ValueOf<Fields[FieldKey]>
}

/** Value of array-fields. */
export type ValueOfArrayFields<Fields> = (
  Fields extends Array<infer Field>
  ? ValueArrayOf<Field>
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
