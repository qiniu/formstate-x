import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, ProxyState } from 'formstate-x'
import { TextField, TextFieldProps } from '@mui/material'
import { bindTextField } from '../../../mui-binding'

function parseNumText(text: string) {
  return /^\d+$/.test(text) ? parseInt(text, 10) : Number.NaN
}

function getNumText(num: number) {
  return Number.isNaN(num) ? '' : (num + '')
}

export function createState() {
  const textState = new FieldState('').validators(
    v => !v && 'Please input a number!'
  )
  const numState = new ProxyState(textState, parseNumText, getNumText).validators(
    v => Number.isNaN(v) && 'Please input a valid numer!'
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
