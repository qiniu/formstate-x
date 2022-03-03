import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { Button, TextField, FormControlLabel, Checkbox, Container } from '@mui/material'

import { bindTextField, bindCheckbox } from '../../mui-binding'

const form = new FormState({
  username: new FieldState('').withValidator(validateUsername),
  password: new FieldState('').withValidator(validatePassword),
  remember: new FieldState(false)
})

export default observer(function Demo() {

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // trigger validation when user want to submit
    const result = await form.validate()
    // if error, do nothing (or maybe show a toast?)
    if (result.hasError) return
    // if no error, wo do next things, such as sending HTTP request
    alert(`Submit with: ${JSON.stringify(result.value, null, 2)}`)
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
      <FormControlLabel
        control={<Checkbox color="primary" {...bindCheckbox(form.$.remember)} />}
        label="Remember me"
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
        Sign In
      </Button>
    </Container>
  )
})

function validateUsername(v: string) {
  if (!v) return 'Please input your username!'
  if (v.length > 10) return 'Too long for username!'
  if (!/^\w+$/.test(v)) return 'Invalid username!'
}

function validatePassword(v: string) {
  if (!v) return 'Please input your password!'
  if (v.length < 8) return 'Too short for password!'
  if (/^[a-zA-Z\d]+$/.test(v)) return 'Too simple for password!'
}
