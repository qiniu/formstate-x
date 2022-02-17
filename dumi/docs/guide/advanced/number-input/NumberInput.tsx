import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, TransformedState } from 'formstate-x'
import { TextField, TextFieldProps } from '@mui/material'
import { bindTextField } from '../../../mui-binding'

function parseNumberText(text: string) {
  return /^\d+$/.test(text) ? parseInt(text, 10) : Number.NaN
}

function getNumberText(num: number) {
  return Number.isNaN(num) ? '' : (num + '')
}

export function createState() {
  const textState = new FieldState('').addValidator(
    v => !v && 'Please input a number!'
  )
  const numState = new TransformedState(
    textState,
    parseNumberText,
    getNumberText
  ).addValidator(
    v => Number.isNaN(v) && 'Please input a valid number!'
  )
  return numState
}

type Props = TextFieldProps & {
  state: ReturnType<typeof createState>
}

export default observer(function NumberInput({ state, ...restProps }: Props) {
  return (
    <TextField
      inputProps={{ inputMode: 'numeric' }}
      {...restProps}
      {...bindTextField(state.$)}
    />
  )
})
