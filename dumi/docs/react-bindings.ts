import { ChangeEvent } from 'react'
import { bindInput as bindRawInput, FieldState } from 'formstate-x'

export interface WithValue<T> {
  value: T
}

export function bindInputWithChangeEvent<T>(state: FieldState<T>) {
  return bindRawInput<T, ChangeEvent<WithValue<T>>>(state, e => e.target.value)
}
