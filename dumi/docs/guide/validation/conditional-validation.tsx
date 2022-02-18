import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindInputWithChangeEvent } from '../../react-bindings'

const validationCtrl = observable({
  enabled: true,
  toggle() {
    this.enabled = !this.enabled
  }
})

function validateName(v: string) {
  if (!validationCtrl.enabled) return
  return v.length > 5 && 'Too long'
}

const state = new FieldState('').withValidator(validateName)

export default observer(function Demo() {
  return (
    <>
      <button onClick={() => validationCtrl.toggle()}>
        {validationCtrl.enabled ? 'Disable' : 'Enable'} Validation
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
