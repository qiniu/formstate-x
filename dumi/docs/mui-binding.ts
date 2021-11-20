/**
 * @file formstate-x binding for MUI
 * @desc Binding functions for demo purpose
 */

import { ChangeEvent } from 'react'
import { FieldState, bindInput, IState, isFormState } from 'formstate-x'

// `bindFormHelperText` bind state validate status to Materail-UI `FormHelperText`
export function bindFormHelperText(state: IState) {
  if (isFormState(state)) {
    return {
      error: state.hasOwnError,
      children: state.ownError
    }
  }
  return {
    error: !!state.error, // TODO
    children: state.error
  }
}

// `bindOutlinedInput` bind field state to Materail-UI `OutlinedInput`
export function bindOutlinedInput(state: FieldState<string>) {
  function getValueFromEvent(e: ChangeEvent<HTMLInputElement>) {
    return e.target.value
  }
  return bindInput(state, getValueFromEvent)
}

// `bindTextField` bind field state to Materail-UI `TextField`
export function bindTextField(state: FieldState<string>) {

  function getValueFromEvent(e: ChangeEvent<HTMLInputElement>) {
    return e.target.value
  }

  return {
    ...bindInput(state, getValueFromEvent),
    error: state.hasError,
    helperText: state.error
  }
}

// `bindTextField` bind field state to Materail-UI `Checkbox`
export function bindCheckbox(state: FieldState<boolean>) {
  function getValueFromEvent(e: ChangeEvent<HTMLInputElement>) {
    return e.target.checked
  }
  const { value, onChange } = bindInput(state, getValueFromEvent)
  return { checked: value, onChange }
}

// `bindTextField` bind field state to Materail-UI `Switch`
export const bindSwitch = bindCheckbox
