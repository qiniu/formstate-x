import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { Button, TextField, Container } from '@mui/material'

import { bindTextField } from '../../mui-binding'

function createFormState() {
  const usernameState = new FieldState('').addValidator(
    v => !v && 'Please input your username!'
  )
  const passwordState = new FieldState('').addValidator(
    v => !v && 'Please input your password!'
  )
  const rePasswordState = new FieldState('').addValidator(
    v => v !== passwordState.value && 'Not the same!'
  )
  return new FormState({
    username: usernameState,
    password: passwordState,
    rePassword: rePasswordState,
  })
}

const form = createFormState()

export default observer(function Demo() {

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = await form.validate()
    if (result.hasError) return
    console.log('Submit with:', result.value)
  }

  return (
    <Container component="form" noValidate onSubmit={handleSubmit} maxWidth="xs">
      <TextField
        label="Username"
        margin="normal"
        fullWidth
        {...bindTextField(form.$.username)}
      />
      <TextField
        label="Password"
        type="password"
        margin="normal"
        fullWidth
        {...bindTextField(form.$.password)}
      />
      <TextField
        label="Comfirm Password"
        type="password"
        margin="normal"
        fullWidth
        {...bindTextField(form.$.rePassword)}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
        Sign Up
      </Button>
    </Container>
  )
})
