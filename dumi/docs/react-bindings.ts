import { ChangeEvent } from 'react'
import { FieldState } from 'formstate-x'

export interface WithValue<T> {
  value: T
}

export function bindInputWithChangeEvent<T>(state: FieldState<T>) {
  return {
    value: state.value,
    onChange(e: ChangeEvent<WithValue<T>>) {
      state.onChange(e.target.value)
    }
  }
}
