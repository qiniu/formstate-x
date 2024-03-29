import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState, TransformedState } from 'formstate-x'
import { TextField, Grid, FormHelperText } from '@mui/material'
import { bindTextField, bindFormHelperText } from '../../../mui-binding'

export function createState() {
  const state = new FormState({
    first: new FieldState('').withValidator(required),
    last: new FieldState('').withValidator(required)
  })
  return new TransformedState(
    state,
    ({ first, last }) => `${first} ${last}`,
    fullName => {
      const [first, last] = fullName.split(' ')
      return { first, last }
    }
  ).withValidator(notReserved)
}

interface Props {
  state: ReturnType<typeof createState>
}

export default observer(function FullNameInput({ state }: Props) {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField label="First Name" margin="normal" {...bindTextField(state.$.$.first)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Last Name" margin="normal" {...bindTextField(state.$.$.last)} />
        </Grid>
      </Grid>
      <FormHelperText {...bindFormHelperText(state)} />
    </>
  )
})

function required(v: string) {
  if (!v) return 'Please input!'
}

function notReserved(v: string) {
  if (v === 'Foo Bar') return `Name "${v}" is reserved!`
}
