import FieldState from './fieldState'
import { bindInput, asyncResponsesAnd, isEmpty } from './utils'

const defaultDelay = 1

function delay<T>(value?: T, delay: number = defaultDelay + 1): Promise<T> {
  return new Promise(
    resolve => setTimeout(() => resolve(value), delay)
  )
}

describe('asyncResponsesAnd', () => {
  it('should work well with empty responses', async () => {
    const result = await asyncResponsesAnd([])
    expect(isEmpty(result)).toBe(true)
  })

  it('should work well with all-passed results', async () => {
    const result = await asyncResponsesAnd([delay(null)])
    expect(isEmpty(result)).toBe(true)

    const result2 = await asyncResponsesAnd([
      delay(null, 3),
      delay(undefined, 1),
      delay(false, 2)
    ])
    expect(isEmpty(result)).toBe(true)
  })

  it('should work well with unpassed results', async () => {
    const result = await asyncResponsesAnd([delay('empty')])
    expect(result).toBe('empty')

    const result2 = await asyncResponsesAnd([
      delay(null, 3),
      delay(undefined, 1),
      delay('empty', 2)
    ])
    expect(result2).toBe('empty')

    const result3 = await asyncResponsesAnd([
      delay(null, 3),
      delay('too long', 1),
      delay(false, 2)
    ])
    expect(result3).toBe('too long')
  })

  it('should work well with multi-unpassed results', async () => {
    const result = await asyncResponsesAnd([
      delay('too many', 3),
      delay(undefined, 1),
      delay('empty', 2)
    ])
    expect(result).toBe('empty')

    const result3 = await asyncResponsesAnd([
      delay('too many', 3),
      delay('too long', 1),
      delay('empty', 2)
    ])
    expect(result3).toBe('too long')
  })
})

describe('bindInput', () => {
  it('should work well', () => {
    const field = new FieldState('')
    const binds = bindInput(field)

    expect(binds.value).toBe('')
    expect(typeof binds.onChange).toBe('function')

    const value = '123'
    binds.onChange(value)
    expect(field._value).toBe(value)

    const newBinds = bindInput(field)
    expect(newBinds.value).toBe(value)
  })

  it('should work well with getValue', () => {
    const field = new FieldState('')
    const binds = bindInput(field, (num: number) => num + '')

    expect(binds.value).toBe('')
    expect(typeof binds.onChange).toBe('function')

    binds.onChange(123)
    expect(field._value).toBe('123')

    const newBinds = bindInput(field)
    expect(newBinds.value).toBe('123')
  })
})
