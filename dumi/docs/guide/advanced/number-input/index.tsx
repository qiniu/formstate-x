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
    const result = await form.validate()
    if (result.hasError) return
    alert(`Submit with: ${JSON.stringify(result.value, null, 2)}`)
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
