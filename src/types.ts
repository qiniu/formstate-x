import FieldState from './fieldState'
import FormState from './formState'

/** A truthy string or falsy values */
export type ValidationResponse =
  string
  | null
  | undefined
  | false

/** The return value of a validator */
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

export interface Validatable<T, TValue = T> {
  $: T
  value: TValue
  hasError: boolean
  error?: string | null | undefined
  validating: boolean
  validated: boolean
  validate(): Promise<{ hasError: true } | { hasError: false, value: TValue }>

  // 这俩暂不实现，有需求再说
  // enableAutoValidation: () => void
  // disableAutoValidation: () => void
}

export interface ComposibleValidatable<T, TValue = T> extends Validatable<T, TValue> {
  reset: () => void
  dispose: () => void
  dirty: boolean
  _activated: boolean
  _validateStatus: ValidateStatus
}

export interface Disposer {
  (): void
}

export type ValueOfFieldState<State> = (
  State extends FieldState<infer FieldType>
  ? FieldType
  : never
)

// workaround for recursive type reference: https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
// not needed for typescript@3.7+: https://github.com/microsoft/TypeScript/pull/33050
export interface ValueArrayOf<Field> extends Array<ValueOf<Field>> {}

export type ValueOfObjectFields<Fields> = {
  [FieldKey in keyof Fields]: ValueOf<Fields[FieldKey]>
}

export type ValueOfArrayFields<Fields> = (
  Fields extends Array<infer Field>
  ? ValueArrayOf<Field>
  : never
)

export type ValueOfFields<Fields> = (
  Fields extends { [key: string]: ComposibleValidatable<any> }
  ? ValueOfObjectFields<Fields>
  : ValueOfArrayFields<Fields>
)

export type ValueOf<State> = (
  State extends FormState<infer Fields>
  ? ValueOfFields<Fields>
  : ValueOfFieldState<State>
)

export enum ValidateStatus {
  // Initialized, // 初始状态（value 未修改），暂不使用，考虑关于是否初始状态的信息，是否应该放在单独的地方去记录
  NotValidated, // 尚未校验
  Validating, // 校验中
  Validated // 校验完成
}

export interface InputBinds<T, E = T> {
  value: T
  onChange(event: E): void
}
