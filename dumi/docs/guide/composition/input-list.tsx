import React, { FormEvent } from 'react'
import { observer } from 'mobx-react'
import { FieldState, ArrayFormState } from 'formstate-x'
import { Button, Container, InputAdornment, IconButton, FormControl, InputLabel, OutlinedInput, FormHelperText } from '@mui/material'
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline'

import { bindFormHelperText, bindOutlinedInput } from '../../mui-binding'

function createNumberState(initialValue: string) {
  return new FieldState(initialValue).withValidator(validatePhoneNumber)
}

const form = new ArrayFormState([], createNumberState).withValidator(validateNumbers)

export default observer(function Demo() {

  function handleAddPhone() {
    form.append('')
  }

  function handleRemovePhone(i: number) {
    form.remove(i)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = await form.validate()
    if (result.hasError) return
    alert(`Submit with: ${JSON.stringify(result.value, null, 2)}`)
  }

  return (
    <Container
      component="form"
      noValidate
      onSubmit={handleSubmit}
      maxWidth="xs"
      style={{ position: 'relative' }}
    >
      {form.$.map((numberState, i) => (
        <NumberInput
          key={i}
          state={numberState}
          onRemove={() => handleRemovePhone(i)}
        />
      ))}
      <Button variant="text" onClick={handleAddPhone}>
        Add Phone Number
      </Button>
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
        Submit
      </Button>
      <FormHelperText {...bindFormHelperText(form)} />
    </Container>
  )
})

interface NumberInputProps {
  state: FieldState<string>
  onRemove: () => void
}

const NumberInput = observer(function NumberInput({ state, onRemove }: NumberInputProps) {
  return (
    <FormControl fullWidth margin="normal" variant="outlined" error={state.hasError}>
      <InputLabel>Phone Number</InputLabel>
      <OutlinedInput
        label="Phone Number"
        type="text"
        {...bindOutlinedInput(state)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton title="Remove" onClick={onRemove} edge="end">
              <RemoveIcon />
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText {...bindFormHelperText(state)} />
    </FormControl>
  )
})

function validateNumbers(numbers: string[]) {
  if (numbers.length <= 0) return 'Please add at least one phone number!'
}

function validatePhoneNumber(number: string) {
  if (!number) return 'Please input your number!'
  return /^\d+$/.test(number) ? null : 'Please input correct number!'
}
