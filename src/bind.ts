import FieldState from './fieldState'

export interface InputBinds<T, E = T> {
  value: T
  onChange(event: E): void
}

// 基础绑定函数，默认使用传入 onChange 的参数值作为 value
// 注意：若直接展开使用这个方法，那么每次都会生成新的 onChange 引用
// TODO: cache onChange
export function bindInput<T>(state: FieldState<T>): InputBinds<T>
export function bindInput<T, E>(state: FieldState<T>, getValue: (e: E) => T): InputBinds<T, E>
export function bindInput(state: any, getValue?: any) {
  return {
    value: state._value,
    onChange: (arg: any) => state.onChange(
      getValue ? getValue(arg) : arg
    )
  }
}
