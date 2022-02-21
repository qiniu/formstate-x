import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindInput } from '../../react-bindings'

function validateName(v: string) {
  return v.length > 5 && 'Too long'
}

const state = new FieldState('').withValidator(validateName)

export default observer(function Demo() {
  return (
    <>
      <label>
        Name (5 characters at most):
        <input type="text" {...bindInput(state)} />
      </label>
      {state.hasError && <span style={errorTipStyle}>{state.error}</span>}
    </>
  )
})

const errorTipStyle = {
  marginLeft: '1em',
  fontSize: '14px',
  color: 'red'
}
