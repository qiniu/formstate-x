import { observable } from 'mobx'
import { ValidationResponse, ValidatorResponse } from './types'
import { asyncResponsesAnd, responsesAnd, isEmpty, isArrayLike } from './utils'

const defaultDelay = 10

function delay<T>(value?: T, delay: number = defaultDelay + 10): Promise<T | undefined> {
  return new Promise<T | undefined>(
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

describe('isArrayLike', () => {
  it('should work well with array', () => {
    expect(isArrayLike([])).toBe(true)
    expect(isArrayLike([1, 2, 3])).toBe(true)
  })
  it('should work well with observable array', () => {
    expect(isArrayLike(observable([]))).toBe(true)
    expect(isArrayLike(observable([1, 2, 3]))).toBe(true)
  })
  it('should recognize non-object values', () => {
    expect(isArrayLike(null)).toBe(false)
    expect(isArrayLike(undefined)).toBe(false)
    expect(isArrayLike(0)).toBe(false)
    expect(isArrayLike('123')).toBe(false)
    expect(isArrayLike(/abc/)).toBe(false)
  })
  it('should recognize normal objects', () => {
    expect(isArrayLike({})).toBe(false)
    expect(isArrayLike({ 0: 'a' })).toBe(false)
    expect(isArrayLike({ a: 1, b: 2 })).toBe(false)
    expect(isArrayLike(observable({ a: 1, b: 2 }))).toBe(false)
  })
  it('should recognize object with invalid length', () => {
    expect(isArrayLike({ length: -1 })).toBe(false)
    expect(isArrayLike({ length: 2.3 })).toBe(false)
  })
})

describe('responsesAnd', () => {

  it('should work well', async () => {
    expect(isEmpty(responsesAnd(['', null, undefined, false]) as ValidationResponse)).toBeTruthy()
    expect(responsesAnd((['foo', 'bar']))).toBe('foo')
    expect(responsesAnd(([null, 'foo', 'bar']))).toBe('foo')
    expect(responsesAnd((['bar', undefined, 'foo']))).toBe('bar')
    expect(responsesAnd((['bar', 'foo', false]))).toBe('bar')
  })

  it('should work well with async responses', async () => {
    expect(isEmpty(await responsesAnd([
      delay(''),
      delay(null),
      delay(undefined),
      delay(false)
    ]))).toBeTruthy()
    expect(await responsesAnd([
      delay(null),
      delay('foo'),
      delay('bar')
    ])).toBe('foo')
    expect(await responsesAnd([
      delay('foo', 20),
      delay(null, 10),
      delay('bar', 30)
    ])).toBe('foo')
    expect(await responsesAnd([
      delay('foo', 30),
      delay(null, 20),
      delay('bar', 10)
    ])).toBe('bar')
    expect(responsesAnd([
      delay('bar'),
      'foo',
      delay(null)
    ])).toBe('foo')
    expect(await responsesAnd([
      '',
      delay('foo'),
      delay('bar')
    ])).toBe('foo')
  })

  it('should avoid unnecessary calls', () => {
    const validators = [
      () => null,
      () => 'foo',
      () => 'bar',
      () => delay('baz')
    ].map(
      (fn: () => ValidatorResponse) => jest.fn(fn)
    )

    function* validate() {
      for (const validator of validators) {
        yield validator()
      }
    }

    expect(responsesAnd(validate())).toBe('foo')
    expect(validators[0]).toBeCalledTimes(1)
    expect(validators[1]).toBeCalledTimes(1)
    expect(validators[2]).not.toBeCalled()
    expect(validators[3]).not.toBeCalled()
  })
})
