import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'

const state = new FieldState('')

export default observer(function Demo() {
  return (
    <>
      <label>
        Plz input your name here:
        <input type="text" {...bindInput(state, e => e.target.value)} />
      </label>
      {state.value && <p>Hello {state.value}!</p>}
    </>
  )
})
