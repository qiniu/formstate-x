import { observable } from 'mobx'
import { asyncResultsAnd, isPassed, isArrayLike, isErrorObject, normalizeError, inValidErrorObjectMsg } from './utils'
import { delayValue as delay } from './testUtils'
import { ValidationErrorObject } from './types'

describe('asyncResultsAnd', () => {
  it('should work well with empty results', async () => {
    const result = await asyncResultsAnd([])
    expect(isPassed(result)).toBe(true)
  })

  it('should work well with all-passed results', async () => {
    const result = await asyncResultsAnd([delay(null)])
    expect(isPassed(result)).toBe(true)

    await asyncResultsAnd([
      delay(null, 30),
      delay(undefined, 10),
      delay(false, 20)
    ])
    expect(isPassed(result)).toBe(true)
  })

  it('should work well with unpassed results', async () => {
    const result = await asyncResultsAnd([delay('empty')])
    expect(result).toBe('empty')

    const result2 = await asyncResultsAnd([
      delay(null, 30),
      delay(undefined, 10),
      delay('empty', 20)
    ])
    expect(result2).toBe('empty')

    const result3 = await asyncResultsAnd([
      delay(null, 30),
      delay('too long', 10),
      delay(false, 20)
    ])
    expect(result3).toBe('too long')
  })

  it('should work well with multi-unpassed results', async () => {
    const result = await asyncResultsAnd([
      delay('too many', 30),
      delay(undefined, 10),
      delay('empty', 20)
    ])
    expect(result).toBe('empty')

    const result3 = await asyncResultsAnd([
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

describe('isErrorObject', () => {
  it('should work well', () => {
    expect(isErrorObject('')).toBe(false)
    expect(isErrorObject(0)).toBe(false)
    expect(isErrorObject(1)).toBe(false)
    expect(isErrorObject(false)).toBe(false)
    expect(isErrorObject(true)).toBe(false)
    expect(isErrorObject(null)).toBe(false)
    expect(isErrorObject(undefined)).toBe(false)
    expect(isErrorObject('foo')).toBe(false)
    expect(isErrorObject({})).toBe(false)
    expect(isErrorObject({ foo: 'foo' })).toBe(false)
    expect(isErrorObject({ message: '' })).toBe(true)
    expect(isErrorObject({ message: 'msg' })).toBe(true)
    expect(isErrorObject({ message: 'msg', extra: 'ext' })).toBe(true)
    expect(isErrorObject(new Error('error msg'))).toBe(true)

    class Foo implements ValidationErrorObject { message = 'mewo' }
    expect(isErrorObject(new Foo())).toBe(true)

    class Bar extends Foo {}
    expect(isErrorObject(new Bar())).toBe(true)
  })
})

describe('normalizeValidationResult', () => {
  it('normalizeError should work well', () => {
    expect(normalizeError(undefined)).toBe(undefined)
    expect(normalizeError('')).toBe(undefined)
    expect(normalizeError('foo')).toBe('foo')
    expect(() => normalizeError({ message: '' })).toThrow(inValidErrorObjectMsg)
    expect(normalizeError({ message: 'mewo' })).toBe('mewo')
    expect(normalizeError(Error('mewo2'))).toBe('mewo2')

    class Foo implements ValidationErrorObject { message = 'mewo' }
    const foo = new Foo()
    expect(normalizeError(foo)).toBe('mewo')

    class Bar extends Foo {}
    const bar = new Bar()
    expect(normalizeError(bar)).toBe('mewo')
  })
})
