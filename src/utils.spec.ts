import { asyncResponsesAnd, isEmpty } from './utils'

const defaultDelay = 10

function delay<T>(value?: T, delay: number = defaultDelay + 10): Promise<T> {
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
      delay(null, 30),
      delay(undefined, 10),
      delay(false, 20)
    ])
    expect(isEmpty(result)).toBe(true)
  })

  it('should work well with unpassed results', async () => {
    const result = await asyncResponsesAnd([delay('empty')])
    expect(result).toBe('empty')

    const result2 = await asyncResponsesAnd([
      delay(null, 30),
      delay(undefined, 10),
      delay('empty', 20)
    ])
    expect(result2).toBe('empty')

    const result3 = await asyncResponsesAnd([
      delay(null, 30),
      delay('too long', 10),
      delay(false, 20)
    ])
    expect(result3).toBe('too long')
  })

  it('should work well with multi-unpassed results', async () => {
    const result = await asyncResponsesAnd([
      delay('too many', 30),
      delay(undefined, 10),
      delay('empty', 20)
    ])
    expect(result).toBe('empty')

    const result3 = await asyncResponsesAnd([
      delay('too many', 30),
      delay('too long', 10),
      delay('empty', 20)
    ])
    expect(result3).toBe('too long')
  })
})
