/**
 * @file adapter tools
 * @description helper methods for adaption between formstate & formstate-x
 */

import * as fs from 'formstate'
import * as fsx from '..'
import { observable } from 'mobx'

export type Xify<T> = fsx.IState<ValueOf<T>> & {
  origin: T
}

/** Convert formstate field / form state into formstate-x state */
export function xify<T extends fs.ComposibleValidatable<any>>(state: T): Xify<T> {
  const stateX: Xify<T> = {
    origin: state,
    get value() {
      // 这里理应有 200ms 的延迟（UI input -> value 的 debounce）
      // 考虑有额外的复杂度，且这里不影响逻辑（只影响性能），故不做处理
      return getValue(state, false)
    },
    get hasError() { return !!this.error },
    get error() { return getError(state) },
    get validating() { return this.validateStatus === fsx.ValidateStatus.Validating },
    get validated() { return this.validateStatus === fsx.ValidateStatus.Validated },
    validationDisabled: false,
    async validate() {
      await state.validate()
      if (this.hasError) return { hasError: true, error: this.error }
      return { hasError: false, value: this.value }
    },
    reset() { state.reset() },
    resetWith(v: ValueOf<T>) { state.reset() },
    set() { throw new Error('`set()` is not supported.') },
    onChange() { throw new Error('`onChange()` is not supported.') },
    dispose() {},
    dirtyWith(v: ValueOf<T>) { return getDirty(state) },
    get dirty() { return getDirty(state) },
    get activated() { return getActivated(state) },
    get validateStatus() { return getValidateStatus(state) }
  }
  return observable(stateX, undefined, { deep: false })
}

/** Value of `FieldState`. */
export type ValueOfFieldState<State> = (
  State extends fs.FieldState<infer FieldType>
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
  Fields extends { [key: string]: fs.ComposibleValidatable<any> }
  ? ValueOfObjectFields<Fields>
  : ValueOfArrayFields<Fields>
)

/** Value of state (`FormState` or `FieldState`) */
export type ValueOf<State> = (
  State extends fs.FormState<infer Fields>
  ? ValueOfFields<Fields>
  : ValueOfFieldState<State>
)

function getValueOfForm<T extends fs.FormState<any>>(state: T, safe: boolean): ValueOf<T> {
  const mode = state['mode']
  if (mode === 'array') {
    return state.$.map(
      (field: any) => getValue(field, safe)
    )
  }
  if (mode === 'object') {
    const fields = state.$
    return Object.keys(fields).reduce(
      (value, key) => ({
        ...value,
        [key]: getValue(fields[key], safe)
      }),
      {}
    ) as any
  }
  throw new Error(`Unsupported mode: ${mode}`)
}

export function getValue<T extends fs.ComposibleValidatable<any>>(state: T, safe: boolean): ValueOf<T> {
  if (state instanceof fs.FieldState) return safe ? state.$ : state.value
  if (state instanceof fs.FormState) return getValueOfForm(state, safe)
  throw new Error(`Expecting ComposibleValidatable value, while got ${typeof state}`)
}

function getValidateStatusOfField(state: fs.FieldState<any>): fsx.ValidateStatus {
  if (state.hasBeenValidated) return fsx.ValidateStatus.Validated
  if (state.validating) return fsx.ValidateStatus.Validating
  return fsx.ValidateStatus.NotValidated
}

function getValidateStatusOfForm(state: fs.FormState<any>): fsx.ValidateStatus {
  const fields = state['getValues']()
  if (fields.every(field => getValidateStatus(field) === fsx.ValidateStatus.NotValidated)) {
    return fsx.ValidateStatus.NotValidated
  }
  if (fields.every(field => getValidateStatus(field) === fsx.ValidateStatus.Validated)) {
    return fsx.ValidateStatus.Validated
  }
  return fsx.ValidateStatus.Validating
}

export function getValidateStatus(state: fs.ComposibleValidatable<any>): fsx.ValidateStatus {
  if (state instanceof fs.FieldState) return getValidateStatusOfField(state)
  if (state instanceof fs.FormState) return getValidateStatusOfForm(state)
  throw new Error(`Expecting ComposibleValidatable value, while got ${typeof state}`)
}

function getDirtyOfField(state: fs.FieldState<any>): boolean {
  return !!state.dirty
}

function getDirtyOfForm(state: fs.FormState<any>): boolean {
  return state['getValues']().some(field => getDirty(field))
}

export function getDirty(state: fs.ComposibleValidatable<any>): boolean {
  if (state instanceof fs.FieldState) return getDirtyOfField(state)
  if (state instanceof fs.FormState) return getDirtyOfForm(state)
  throw new Error(`Expecting ComposibleValidatable value, while got ${typeof state}`)
}

function getActivatedOfField(state: fs.FieldState<any>): boolean {
  return !!(state['_autoValidationEnabled'] && state.dirty)
}

function getActivatedOfForm(state: fs.FormState<any>): boolean {
  return state['getValues']().some(field => getActivated(field))
}

export function getActivated(state: fs.ComposibleValidatable<any>): boolean {
  if (state instanceof fs.FieldState) return getActivatedOfField(state)
  if (state instanceof fs.FormState) return getActivatedOfForm(state)
  throw new Error(`Expecting ComposibleValidatable value, while got ${typeof state}`)
}

function getError(state: fs.ComposibleValidatable<any>) {
  return state.hasError ? (state.error as string) : undefined
}
