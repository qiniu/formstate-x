import React, { ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { FieldState } from 'formstate-x'

// `bindSwitch` bind field state to Materail-UI `Switch`
function bindSwitch(state: FieldState<boolean>) {
  return {
    checked: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.checked)
    }
  }
}

// `bindTextField` bind field state to Materail-UI `TextField`
function bindTextField(state: FieldState<string>) {
  return {
    value: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.value)
    },
    error: state.hasError,
    helperText: state.error
  }
}

const disabledState = new FieldState(false)
const usernameState = new FieldState('').withValidator(validateUsername)

export default observer(function Demo() {
  return (
    <>
      <div style={{ height: '56px'}}>
        <Switch {...bindSwitch(disabledState)} />
      </div>
      <div style={{ height: '80px' }}>
        <TextField
          label="I'm bound"
          variant="outlined"
          {...bindTextField(usernameState)}
        />
      </div>
    </>
  )
})

function validateUsername(v: string) {
  if (!v) return 'Please input your username!'
  if (v.length > 10) return 'Too long for username!'
  if (!/^\w+$/.test(v)) return 'Invalid username!'
}
