/**
 * @file formstate-x binding for MUI
 * @desc Binding functions for demo purpose
 */

import { ChangeEvent } from 'react'
import { FieldState, IState } from 'formstate-x'

// `bindFormHelperText` bind state validate status to Materail-UI `FormHelperText`
export function bindFormHelperText(state: IState) {
  return {
    error: state.hasOwnError,
    children: state.ownError
  }
}

// `bindOutlinedInput` bind field state to Materail-UI `OutlinedInput`
export function bindOutlinedInput(state: FieldState<string>) {
  return {
    value: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.value)
    }
  }
}

// `bindTextField` bind field state to Materail-UI `TextField`
export function bindTextField(state: FieldState<string>) {
  return {
    value: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.value)
    },
    error: state.hasOwnError,
    helperText: state.ownError
  }
}

// `bindTextField` bind field state to Materail-UI `Checkbox`
export function bindCheckbox(state: FieldState<boolean>) {
  return {
    checked: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.checked)
    }
  }
}

// `bindTextField` bind field state to Materail-UI `RadioGroup`
export function bindRadioGroup<T extends string>(state: FieldState<T>) {
  return {
    value: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.value as T)
    }
  }
}

// `bindTextField` bind field state to Materail-UI `Switch`
export const bindSwitch = bindCheckbox
