import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'
import { Button, TextField, FormControl, FormLabel, FormControlLabel, Container, Radio, RadioGroup } from '@mui/material'

import { bindRadioGroup, bindTextField } from '../../mui-binding'

enum SignInBy {
  Password = 'password',
  Phone = 'phone'
}

const by = new FieldState(SignInBy.Password)

const formByPassword = new FormState({
  username: new FieldState('').withValidator(required),
  password: new FieldState('').withValidator(required)
})

const formByPhone = new FormState({
  phone: new FieldState('').withValidator(required),
  code: new FieldState('').withValidator(required)
})

const form = new FormState({
  by: by,
  byPassword: formByPassword.disableWhen(() => by.value != SignInBy.Password),
  byPhone: formByPhone.disableWhen(() => by.value != SignInBy.Phone)
})

export default observer(function Demo() {

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = await form.validate()
    if (result.hasError) return
    alert(`Submit with: ${JSON.stringify(result.value, null, 2)}`)
  }

  return (
    <Container component="form" noValidate onSubmit={handleSubmit} maxWidth="xs">
      <FormControl>
        <FormLabel>Sign in by</FormLabel>
        <RadioGroup row {...bindRadioGroup(form.$.by)}>
          <FormControlLabel label="Phone" value={SignInBy.Phone} control={<Radio />} />
          <FormControlLabel label="Password" value={SignInBy.Password} control={<Radio />} />
        </RadioGroup>
      </FormControl>
      {form.value.by === SignInBy.Password && (<>
        <TextField label="Username" margin="normal" fullWidth {...bindTextField(form.$.byPassword.$.username)} />
        <TextField label="Password" type="password" margin="normal" fullWidth {...bindTextField(form.$.byPassword.$.password)} />
      </>)}
      {form.value.by === SignInBy.Phone && (<>
        <TextField label="Phone" margin="normal" fullWidth {...bindTextField(form.$.byPhone.$.phone)} />
        <TextField label="Code" margin="normal" fullWidth {...bindTextField(form.$.byPhone.$.code)} />
      </>)}
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>Sign In</Button>
    </Container>
  )
})

function required(v: string) {
  if (!v) return 'Please input!'
}
