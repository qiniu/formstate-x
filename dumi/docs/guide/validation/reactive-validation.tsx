import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { bindInputWithChangeEvent } from '../../react-bindings'

const someObservableStore = observable({
  strict: true,
  get lengthLimit() {
    return this.strict ? 5 : 10
  },
  toggleStrict() {
    this.strict = !this.strict
  }
})

const validateName = (v: string) => {
  if (v.length > someObservableStore.lengthLimit) {
    return 'Too long'
  }
}

const state = new FieldState('').addValidator(validateName)

export default observer(function Demo() {
  return (
    <>
      <p>
        <button onClick={() => someObservableStore.toggleStrict()}>
          Toggle strict-check
        </button>
        {someObservableStore.lengthLimit} characters at most
      </p>
      <p>
        <label>
          Name:
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
