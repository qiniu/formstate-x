import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import { FormState } from 'formstate-x'
import { Button, Container } from '@mui/material'

import NumberInput, { createState as createNumState } from './NumberInput'

const form = new FormState({
  num: createNumState(),
})

export default observer(function Demo() {

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // trigger validation when user want to submit
    const result = await form.validate()
    // if error, do nothing (or maybe show a toast?)
    if (result.hasError) return
    // if no error, wo do next things, such as sending HTTP request
    console.log('Submit with:', result.value)
  }

  return (
    <Container component="form" noValidate onSubmit={handleSubmit} maxWidth="xs">
      <NumberInput
        label="Number"
        margin="normal"
        fullWidth
        state={form.$.num}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
        Submit
      </Button>
    </Container>
  )
})
