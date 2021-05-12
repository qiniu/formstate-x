import * as fs from 'formstate'
import * as fsx from '..'
import { xify, getValue, getValidateStatus, getDirty, getActivated } from '.'

const stableDelay = 200 * 2 + 10 // [onChange debounce] + [async validate] + [buffer]

async function delay(millisecond: number = stableDelay) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), millisecond))
}

describe('xify', () => {

  it('should work well', () => {
    const stateName = xify(new fs.FieldState('foo'))
    const statePos = xify(new fs.FormState({
      x: new fs.FieldState(10),
      y: new fs.FieldState(20)
    }))
    const state = new fsx.FormState({
      name: stateName,
      pos: statePos
    })
    expect(state.value).toEqual({
      name: 'foo',
      pos: { x: 10, y: 20 }
    })
  })

  it('should work well with field state', () => {
    const state = new fs.FieldState(0)
    const stateX = xify(state)
    expect(stateX.value).toBe(0)
    expect(stateX.$).toBe(0)
    expect(stateX.origin).toBe(state)
  })

  it('should work well with form state', () => {
    const state = new fs.FormState({
      a: new fs.FieldState('a'),
      b: new fs.FormState({
        c: new fs.FieldState(1)
      })
    })
    const stateX = xify(state)
    expect(stateX.value).toEqual({ a: 'a', b: { c: 1 } })
    expect(stateX.$).toEqual({ a: 'a', b: { c: 1 } })
    expect(stateX.origin).toBe(state)
  })

  it('should work well with form state of mode "array"', () => {
    const stateX = xify(new fs.FormState([
      new fs.FieldState('a'),
      new fs.FormState({
        c: new fs.FieldState(1)
      })
    ]))
    expect(stateX.value).toEqual(['a', { c: 1 }])
    expect(stateX.$).toEqual(['a', { c: 1 }])
  })

  it('should work well with field state\'s error', async () => {
    const state = new fs.FieldState(0).validators(v => v !== 0 && 'expect zero')
    const stateX = xify(state)
    expect(stateX.hasError).toBe(false)
    expect(stateX.error == null).toBe(true)

    state.onChange(1)
    await state.validate()
    expect(stateX.hasError).toBe(true)
    expect(stateX.error).toBe('expect zero')

    state.onChange(0)
    await state.validate()
    expect(stateX.hasError).toBe(false)
    expect(stateX.error == null).toBe(true)
  })

  it('should work well with form state\'s error', async () => {
    const state = new fs.FormState({
      num: new fs.FieldState(0).validators(v => v !== 0 && 'expect zero')
    })
    const stateX = xify(state)
    expect(stateX.hasError).toBe(false)
    expect(stateX.error == null).toBe(true)

    state.$.num.onChange(1)
    await state.validate()
    expect(stateX.hasError).toBe(true)
    expect(stateX.error).toBe('expect zero')

    state.$.num.onChange(0)
    await state.validate()
    expect(stateX.hasError).toBe(false)
    expect(stateX.error == null).toBe(true)
  })

  it('should work well with field state\'s validate status (sync validator)', async () => {
    const state = new fs.FieldState(0).validators(v => v !== 0 && 'expect zero')
    const stateX = xify(state)
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.NotValidated)

    state.onChange(1)
    await state.validate()
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.Validated)

    state.onChange(0)
    await state.validate()
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.Validated)

    stateX.reset()
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.NotValidated)
  })

  it('should work well with field state\'s validate status (async validator)', async () => {
    const state = new fs.FieldState(0).validators(async v => {
      await delay(100)
      return v !== 0 && 'expect zero'
    })
    const stateX = xify(state)
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.NotValidated)

    state.onChange(1)
    const validated = state.validate()
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.Validating)
    await validated
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.Validated)
  })

  it('should work well with form state\'s validate status', async () => {
    const numState = new fs.FieldState(0).validators(async v => {
      await delay(100)
      return v !== 0 && 'expect zero'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.NotValidated)

    state.$.num.onChange(1)
    const validated = state.validate()
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.Validating)
    await validated
    expect(stateX._validateStatus).toBe(fsx.ValidateStatus.Validated)
  })

  it('should work well with field state\'s $', async () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    expect(stateX.$).toBe(1)

    state.onChange(0)
    await state.validate()
    expect(stateX.$).toBe(1)

    state.onChange(2)
    const validated = state.validate()
    expect(stateX.$).toBe(1)
    await validated
    expect(stateX.$).toBe(2)
  })

  it('should work well with form state\'s $', async () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    expect(stateX.$).toEqual({ num: 1 })

    state.$.num.onChange(0)
    await state.validate()
    expect(stateX.$).toEqual({ num: 1 })

    state.$.num.onChange(2)
    const validated = state.validate()
    expect(stateX.$).toEqual({ num: 1 })
    await validated
    expect(stateX.$).toEqual({ num: 2 })
  })

  it('should work well with field state\'s validate()', async () => {
    const state = new fs.FieldState(0).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    let res = await stateX.validate()
    expect(res).toEqual({ hasError: true, error: 'positive required' })
    expect(stateX.hasError).toBe(true)
    expect(stateX.error).toBe('positive required')

    state.onChange(1)
    res = await stateX.validate()
    expect(res).toEqual({ hasError: false, value: 1 })
    expect(stateX.hasError).toBe(false)
    expect(stateX.error == null).toBe(true)
  })

  it('should work well with form state\'s validate()', async () => {
    const numState = new fs.FieldState(0).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    let res = await stateX.validate()
    expect(res).toEqual({ hasError: true, error: 'positive required' })
    expect(stateX.hasError).toBe(true)
    expect(stateX.error).toBe('positive required')

    state.$.num.onChange(1)
    res = await stateX.validate()
    expect(res).toEqual({ hasError: false, value: { num: 1 } })
    expect(stateX.hasError).toBe(false)
    expect(stateX.error == null).toBe(true)
  })

  it('should work well with field state\'s reset()', async () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    state.onChange(0)
    await stateX.validate()
    stateX.reset()

    expect(stateX.validating).toBe(false)
    expect(stateX.validated).toBe(false)
    expect(stateX.value).toBe(1)
    expect(stateX.$).toBe(1)
    expect(stateX.hasError).toBe(false)
    expect(stateX.error).toBeUndefined()
    expect(stateX._activated).toBe(false)
  })

  it('should work well with form state\'s reset()', async () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    state.$.num.onChange(0)
    await stateX.validate()
    stateX.reset()

    expect(stateX.validating).toBe(false)
    expect(stateX.validated).toBe(false)
    expect(stateX.value).toEqual({ num: 1 })
    expect(stateX.$).toEqual({ num: 1 })
    expect(stateX.hasError).toBe(false)
    expect(stateX.error).toBeUndefined()
    expect(stateX.dirty).toBe(false)
    expect(stateX._activated).toBe(false)
  })

  it('should work well with field state\'s dispose()', () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    stateX.dispose()
  })

  it('should work well with form state\'s dispose()', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    stateX.dispose()
  })

  it('should work well with field state\'s dirty', async () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    expect(stateX.dirty).toBe(false)
    state.onChange(0)
    expect(stateX.dirty).toBe(true)
    await stateX.validate()
    expect(stateX.dirty).toBe(true)
  })

  it('should work well with form state\'s dirty', async () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    expect(stateX.dirty).toBe(false)
    state.$.num.onChange(0)
    expect(stateX.dirty).toBe(true)
    await stateX.validate()
    expect(stateX.dirty).toBe(true)
  })

  it('should work well with field state\'s _dirtyWith()', async () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)

    expect(stateX._dirtyWith(1)).toBe(false) // actually, `1` is not used
    expect(stateX._dirtyWith(2)).toBe(false) // actually, `2` is not used

    state.onChange(0)
    await stateX.validate()

    expect(stateX._dirtyWith(1)).toBe(true) // actually, `1` is not used
    expect(stateX._dirtyWith(2)).toBe(true) // actually, `2` is not used
  })

  it('should work well with form state\'s _dirtyWith()', async () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)

    expect(stateX._dirtyWith({ num: 1 })).toBe(false) // actually, `{ num: 1 }` is not used
    expect(stateX._dirtyWith({ num: 2 })).toBe(false) // actually, `{ num: 2 }` is not used

    state.$.num.onChange(0)
    await stateX.validate()

    expect(stateX._dirtyWith({ num: 1 })).toBe(true) // actually, `{ num: 1 }` is not used
    expect(stateX._dirtyWith({ num: 2 })).toBe(true) // actually, `{ num: 2 }` is not used
  })

  it('should work well with field state\'s _activated', async () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    expect(stateX._activated).toBe(false)
    state.onChange(0)
    expect(stateX._activated).toBe(true)
    await stateX.validate()
    expect(stateX._activated).toBe(true)
  })

  it('should work well with form state\'s _activated', async () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    expect(stateX._activated).toBe(false)
    state.$.num.onChange(0)
    expect(stateX._activated).toBe(true)
    await stateX.validate()
    expect(stateX._activated).toBe(true)
  })

  it('should work well with field state\'s resetWith()', async () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const stateX = xify(state)
    state.onChange(0)
    await stateX.validate()
    stateX.resetWith(2) // actually, `2` is not used

    expect(stateX.validating).toBe(false)
    expect(stateX.validated).toBe(false)
    expect(stateX.value).toBe(1)
    expect(stateX.$).toBe(1)
    expect(stateX.hasError).toBe(false)
    expect(stateX.error).toBeUndefined()
    expect(stateX._activated).toBe(false)
  })

  it('should work well with form state\'s resetWith()', async () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    const stateX = xify(state)
    state.$.num.onChange(0)
    await stateX.validate()
    stateX.resetWith({ num: 2 }) // actually, `{ num: 2 }` is not used

    expect(stateX.validating).toBe(false)
    expect(stateX.validated).toBe(false)
    expect(stateX.value).toEqual({ num: 1 })
    expect(stateX.$).toEqual({ num: 1 })
    expect(stateX.hasError).toBe(false)
    expect(stateX.error).toBeUndefined()
    expect(stateX.dirty).toBe(false)
    expect(stateX._activated).toBe(false)
  })

  it('should throw with field state\'s set', () => {
    const state = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    expect(() => {
      const stateX = xify(state)
      stateX.set(2)
    }).toThrow()
  })

  it('should throw with form state\'s set', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState({
      num: numState
    })
    expect(() => {
      const stateX = xify(state)
      stateX.set({ num: 2 })
    }).toThrow()
  })

  it('should throw with FormStateLazy', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormStateLazy(() => [numState])
    expect(() => {
      const stateX = xify(state as any)
      console.log(stateX.value)
    }).toThrow()
  })

  it('should throw with formstate of mode "map"', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormState(new Map([
      ['num', numState]
    ]))

    expect(() => {
      const stateX = xify(state)
      console.log(stateX.value)
    }).toThrow()
  })

  it('should throw with formstate which contains formstate of mode "map"', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const mapState = new fs.FormState(new Map([
      ['num', numState]
    ]))
    const state = new fs.FormState({
      map: mapState
    })
    expect(() => {
      const stateX = xify(state)
      console.log(stateX.value)
    }).toThrow()
  })
})

describe('getValue', () => {
  it('should throw with FormStateLazy', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormStateLazy(() => [numState])

    expect(() => getValue(state as any, true)).toThrow()
    expect(() => getValue(state as any, false)).toThrow()
  })
})

describe('getValidateStatus', () => {
  it('should throw with FormStateLazy', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormStateLazy(() => [numState])

    expect(() => getValidateStatus(state as any)).toThrow()
    expect(() => getValidateStatus(state as any)).toThrow()
  })
})

describe('getDirty', () => {
  it('should throw with FormStateLazy', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormStateLazy(() => [numState])

    expect(() => getDirty(state as any)).toThrow()
    expect(() => getDirty(state as any)).toThrow()
  })
})

describe('getActivated', () => {
  it('should throw with FormStateLazy', () => {
    const numState = new fs.FieldState(1).validators(async v => {
      await delay(100)
      return v <= 0 && 'positive required'
    })
    const state = new fs.FormStateLazy(() => [numState])

    expect(() => getActivated(state as any)).toThrow()
    expect(() => getActivated(state as any)).toThrow()
  })
})
