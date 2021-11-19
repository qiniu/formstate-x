import FieldState from './fieldState'

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
export function bindInput<T, E>(state: FieldState<T>, getValue: (e: E) => T): InputBindings<T, E>
export function bindInput(state: any, getValue?: any) {
  return {
    value: state._value,
    // TODO: cache onChange
    onChange: (arg: any) => state.onChange(
      getValue ? getValue(arg) : arg
    )
  }
}
