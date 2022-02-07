import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { TextField, Grid } from '@mui/material'
import { bindTextField } from '../../../mui-binding'

export function createState() {
  return new FormState({
    first: new FieldState('').validators(required),
    last: new FieldState('').validators(required)
  })
}

interface Props {
  state: ReturnType<typeof createState>
}

export default observer(function FullNameInput({ state }: Props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField label="First Name" margin="normal" {...bindTextField(state.$.first)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField label="Last Name" margin="normal" {...bindTextField(state.$.last)} />
      </Grid>
    </Grid>
  )
})

function required(v: string) {
  if (!v) return 'Please input!'
}
