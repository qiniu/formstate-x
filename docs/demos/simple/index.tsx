import React, { useRef } from 'react'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'

export default observer(function Demo() {
  const state = useRef(new FieldState('')).current
  return (
    <div>
      <input type="text" {...bindInput(state, e => e.target.value)} />
      <p>{state.value}</p>
    </div>
  )
})
