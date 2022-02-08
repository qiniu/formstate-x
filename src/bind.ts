import { FieldState } from './fieldState'
import DebouncedFieldState from './debouncedState'

/**
 * Bindings for input component.
 * Typical React input component accepts `value` & `onChange` to bind value.
 */
export interface InputBindings<T, E = T> {
  value: T
  onChange(event: E): void
}

/**
 * Helper method to bind state to your input component.
 * You can define your own bindInput by specifying `getValue`.
 */
export function bindInput<T>(state: FieldState<T>): InputBindings<T>
export function bindInput<T>(state: DebouncedFieldState<T>): InputBindings<T>
export function bindInput<T, E>(state: FieldState<T>, getValue: (e: E) => T): InputBindings<T, E>
export function bindInput<T, E>(state: DebouncedFieldState<T>, getValue: (e: E) => T): InputBindings<T, E>
export function bindInput(state: any, getValue?: any) {
  let uiState: FieldState<any>
  if (state instanceof DebouncedFieldState) {
    uiState = state.$
  } else {
    uiState = state
  }
  return {
    value: uiState.value,
    // TODO: cache onChange
    onChange: (arg: any) => uiState.onChange(
      getValue ? getValue(arg) : arg
    )
  }
}
