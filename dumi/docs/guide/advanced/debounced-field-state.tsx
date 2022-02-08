import React from 'react'
import { observer } from 'mobx-react'
import { DebouncedFieldState } from 'formstate-x'

const state = new DebouncedFieldState('')

export default observer(function Demo() {

  // Use `state.$` instead of state for UI binding.
  const stateForBinding = state.$

  return (
    <>
      <label>
        Plz input your name here:&nbsp;
        <input
          type="text"
          value={stateForBinding.value}
          onChange={e => stateForBinding.onChange(e.target.value)}
        />
      </label>
      {/* Use `state` in other parts of application */}
      {state.value && <p>Hello {state.value}!</p>}
    </>
  )
})
