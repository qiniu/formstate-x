import FieldState from './fieldState'
import { bindInput } from './bind'

describe('bindInput', () => {
  it('should work well', () => {
    const field = new FieldState('')
    const binds = bindInput(field)

    expect(binds.value).toBe('')
    expect(typeof binds.onChange).toBe('function')

    const value = '123'
    binds.onChange(value)
    expect(field._rawValue).toBe(value)

    const newBinds = bindInput(field)
    expect(newBinds.value).toBe(value)
  })

  it('should work well with getValue', () => {
    const field = new FieldState('')
    const binds = bindInput(field, (num: number) => num + '')

    expect(binds.value).toBe('')
    expect(typeof binds.onChange).toBe('function')

    binds.onChange(123)
    expect(field._rawValue).toBe('123')

    const newBinds = bindInput(field)
    expect(newBinds.value).toBe('123')
  })
})
