import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { Button, TextField, Container } from '@mui/material'

import { bindTextField } from '../../../mui-binding'
import FullNameInput, { createState as createFullNameState } from './FullNameInput'

const form = new FormState({
  name: createFullNameState(),
  email: new FieldState('').addValidator(validateEmail)
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
      <FullNameInput state={form.$.name} />
      <TextField
        label="Email Address"
        margin="normal"
        fullWidth
        {...bindTextField(form.$.email)}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
        Submit
      </Button>
    </Container>
  )
})

function validateEmail(v: string) {
  if (!v) return 'Please input your email!'
}
