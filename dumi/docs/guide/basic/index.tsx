import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'

const state = new FieldState('')

export default observer(function Demo() {
  return (
    <>
      <label>
        Plz input your name here:&nbsp;
        <input
          type="text"
          value={state.value}
          onChange={e => state.onChange(e.target.value)}
        />
      </label>
      {state.value && <p>Hello {state.value}!</p>}
    </>
  )
})
