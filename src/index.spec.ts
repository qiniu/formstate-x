import { FieldState, FormState, ArrayFormState, bindInput } from '.'

describe('FieldState', () => {
  it('should be newable', () => {
    expect(typeof FieldState).toBe('function')
    expect(FieldState.prototype).toBeTruthy()
  })
})

describe('FormState', () => {
  it('should be newable', () => {
    expect(typeof FormState).toBe('function')
    expect(FormState.prototype).toBeTruthy()
  })
})

describe('ArrayFormState', () => {
  it('should be newable', () => {
    expect(typeof ArrayFormState).toBe('function')
    expect(ArrayFormState.prototype).toBeTruthy()
  })
})

describe('bindInput', () => {
  it('should be callable', () => {
    expect(typeof bindInput).toBe('function')
  })
})
