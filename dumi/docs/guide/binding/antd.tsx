import React, { ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import { Form, Input } from 'antd'
import { FieldState } from 'formstate-x'

import 'antd/dist/antd.css'

// `bindInput` bind field state to antd `Input` & `Input.Password` (for value change)
function bindInput(state: FieldState<string>) {
  return {
    value: state.value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      state.onChange(e.target.value)
    }
  }
}

// `bindFormItem` bind field state to antd `Form.Item` (for validation result)
function bindFormItem(state: FieldState<unknown>) {
  if (state.validating) return { hasFeedback: true, validateStatus: 'validating' } as const
  if (state.validated && !state.hasError) return { validateStatus: 'success' } as const
  if (state.validated && state.hasError) return { validateStatus: 'error', help: state.error } as const
}

const usernameState = new FieldState('').addValidator(validateUsername)

export default observer(function Demo() {
  return (
    <Form layout="vertical" style={{ maxWidth: '400px' }}>
      <Form.Item label="Username" {...bindFormItem(usernameState)}>
        <Input {...bindInput(usernameState)} />
      </Form.Item>
    </Form>
  )
})

function validateUsername(v: string) {
  if (!v) return 'Please input your username!'
  if (v.length > 10) return 'Too long for username!'
  if (!/^\w+$/.test(v)) return 'Invalid username!'
}
