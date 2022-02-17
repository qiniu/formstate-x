import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindInputWithChangeEvent } from '../../react-bindings'

const validateNotEmpty = (v: string) => v.trim() === '' && 'Empty'
const validateLength = (v: string) => v.length > 5 && 'Too long'

const state = new FieldState('').addValidator(
  validateNotEmpty,
  validateLength
)

export default observer(function Demo() {
  return (
    <>
      <label>
        Name:
        <input type="text" {...bindInputWithChangeEvent(state)} />
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
