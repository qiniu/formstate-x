import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindInputWithChangeEvent } from '../../react-bindings'

const validationState = observable({
  enabled: true,
  toggle() {
    this.enabled = !this.enabled
  }
})

const validateName = (v: string) => {
  if (!validationState.enabled) return
  return v.length > 5 && 'Too long'
}

const state = new FieldState('').validators(validateName)

export default observer(function Demo() {
  return (
    <>
      <button onClick={() => validationState.toggle()}>
        {validationState.enabled ? 'Disable' : 'Enable'} Validation
      </button>
      <p>
        <label>
          Name (5 characters at most):
          <input type="text" {...bindInputWithChangeEvent(state)} />
        </label>
        {state.hasError && <span style={errorTipStyle}>{state.error}</span>}
      </p>
    </>
  )
})

const errorTipStyle = {
  marginLeft: '1em',
  fontSize: '14px',
  color: 'red'
}
