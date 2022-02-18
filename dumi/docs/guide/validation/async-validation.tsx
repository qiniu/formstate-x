import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindInputWithChangeEvent } from '../../react-bindings'

function validateName(v: string) {
  return new Promise<string | false>(resolve => {
    // you can call HTTP API, or do other async stuff here
    setTimeout(() => {
      resolve(v.length > 5 && 'Too long')
    }, 1000)
  })
}

const state = new FieldState('').addValidator(validateName)

export default observer(function Demo() {
  return (
    <>
      <label>
        Name:
        <input type="text" {...bindInputWithChangeEvent(state)} />
      </label>
      {state.validating && <span style={tipStyle}>validating...</span>}
      {state.validated && state.hasError && <span style={errorTipStyle}>{state.error}</span>}
    </>
  )
})

const tipStyle = {
  marginLeft: '1em',
  fontSize: '14px',
}

const errorTipStyle = {
  ...tipStyle,
  color: 'red'
}
