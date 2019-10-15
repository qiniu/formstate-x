import { when, observable, runInAction, spy, autorun, isObservable } from 'mobx'
import FieldState from './fieldState'
import FormState from './formState'

// spy((event) => {
//   if (event.type === 'action') {
//     console.log(`${event.name} with args: ${event.arguments}`)
//   }
// })

const defaultDelay = 1

function delay<T>(value?: T, delay: number = defaultDelay + 1): Promise<T> {
  return new Promise(
    resolve => setTimeout(() => resolve(value), delay)
  )
}

// 注意，不同于 stats.validated
// stats.validated: state 的中的值均经过 validate
// validateFinished: 本次（onChange）触发的 validate 行为完成，未变更字段可能未执行 validate
async function validateFinished(state: FormState<any>) {
  await when(() => state.validating)
  await when(() => !state.validating)
}

function createFieldState<T>(initialValue: T) {
  return new FieldState(initialValue, defaultDelay)
}

describe('FormState (mode: object)', () => {
  it('should initialize well', () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    })

    expect(state.value).toEqual(initialValue)
    expect(isObservable(state.$)).toBe(true)
    expect(state.$.foo).toBeInstanceOf(FieldState)
    expect(state.$.foo.$).toBe(initialValue.foo)
    expect(state.$.bar).toBeInstanceOf(FieldState)
    expect(state.$.bar.$).toBe(initialValue.bar)
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should initialize well with observable fields', () => {
    const initialValue = { foo: 123, bar: '456' }
    const fields = observable({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }, undefined, { deep: false })
    const state = new FormState(fields)

    expect(state.value).toEqual(initialValue)
    expect(isObservable(state.$)).toBe(true)

    state.dispose()
  })

  it('should compose fields well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    })

    const value = { foo: 0, bar: '123' }
    state.$.foo.onChange(value.foo)
    state.$.bar.onChange(value.bar)
    await when(() => state.validated)

    expect(state.value).toEqual(value)
    expect(state.$.foo.$).toBe(value.foo)
    expect(state.$.bar.$).toBe(value.bar)
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = { foo: 123, bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    })

    state.$.foo.onChange(0)
    state.$.bar.onChange('123')
    await when(() => state.validated)
    state.reset()

    expect(state.value).toEqual(initialValue)
    expect(state.$.foo.$).toBe(initialValue.foo)
    expect(state.$.bar.$).toBe(initialValue.bar)
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('FormState (mode: object) validation', () => {
  it('should work well when initialized', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with fields onChange()', async () => {
    const initialValue = { foo: '', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    state.$.foo.onChange('123')

    await when(() => state.validating)
    await when(() => !state.validating)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with validate()', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')

    state.validate()

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(({ foo, bar }) => foo === bar && 'same')
    state.validate()
    await when(() => state.validated)

    state.reset()
    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with multiple validators', async () => {
    const initialValue = { foo: '', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
      ({ foo }) => foo === '' && 'empty'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.foo.onChange('456')

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.$.bar.onChange('123')

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => foo === bar && delay('same')
    )
    state.validate()

    await when(() => state.validating)
    expect(state.validating).toBe(true)
    expect(state.validated).toBe(false)

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => foo === bar && delay('same'),
      ({ foo }) => foo === '' && 'empty'
    )
    state.validate()

    await validateFinished(state)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.$.foo.onChange('')

    await validateFinished(state)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.$.foo.onChange('456')

    await validateFinished(state)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const options = observable({ checkSame: true })
    const initialValue = { foo: '', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => options.checkSame && foo === bar && 'same',
    )

    state.$.foo.onChange('123')
    await validateFinished(state)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    runInAction(() => options.checkSame = false)
    await validateFinished(state)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.checkSame = true)
    await validateFinished(state)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('same')

    state.$.bar.onChange('456')
    await validateFinished(state)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const initialValue = { foo: '123', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo),
      bar: createFieldState(initialValue.bar)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
    )
    state.$.foo.onChange('')

    await validateFinished(state)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.validators(({ foo }) => foo === '' && 'empty')
    await validateFinished(state)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })

  it('should work well with fields\' validating', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = { foo: '', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo).validators(notEmpty),
      bar: createFieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
    )
    state.validate()

    await when(() => state.validated)
    expect(state.$.foo.error).toBe('empty')
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$.foo.onChange('123')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBe('same')

    state.$.bar.onChange('')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBe('empty')
    expect(state.error).toBe('empty')

    state.$.bar.onChange('123')
    state.$.foo.onChange('456')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123456')
    state.$.foo.onChange('123456')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with fields\' async validating', async () => {
    const notEmpty = (value: string) => value === '' && delay('empty')
    const initialValue = { foo: '', bar: '456' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo).validators(notEmpty),
      bar: createFieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => foo === bar && delay('same', 10),
    )
    state.validate()

    await when(() => state.validated)
    expect(state.$.foo.error).toBe('empty')
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBe('empty')

    state.$.foo.onChange('123')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBe('same')

    state.$.bar.onChange('')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBe('empty')
    expect(state.error).toBe('empty')

    state.$.bar.onChange('123')
    state.$.foo.onChange('456')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$.bar.onChange('123456')
    state.$.foo.onChange('123456')
    await when(() => state.validated)
    expect(state.$.foo.error).toBeUndefined()
    expect(state.$.bar.error).toBeUndefined()
    expect(state.error).toBe('same')

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const options = observable({ disabled: false })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = { foo: '123', bar: '123' }
    const state = new FormState({
      foo: createFieldState(initialValue.foo).validators(notEmpty),
      bar: createFieldState(initialValue.bar).validators(notEmpty)
    }).validators(
      ({ foo, bar }) => foo === bar && 'same',
    ).disableValidationWhen(
      () => options.disabled
    )

    runInAction(() => options.disabled = true)

    const validated = state.validate()
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)

    await validated
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$.foo.onChange('')
    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.disabled = false)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })
})

describe('FormState (mode: array)', () => {
  it('should initialize well', () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    ))

    expect(state.value).toEqual(initialValue)
    expect(state.$).toHaveLength(initialValue.length)
    state.$.forEach((field, i) => {
      expect(field).toBeInstanceOf(FieldState)
      expect(field.$).toBe(initialValue[i])
    })
    expect(state.dirty).toBe(false)

    state.dispose()
  })

  it('should compose fields well', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    ))

    const value = ['456', '789']
    state.$.forEach((field, i) => field.onChange(value[i]))
    await when(() => state.validated)

    expect(state.value).toEqual(value)
    state.$.forEach((field, i) => {
      expect(field.$).toBe(value[i])
    })
    expect(state.dirty).toBe(true)

    state.dispose()
  })

  it('should reset well', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    ))

    const value = ['456', '789']
    state.$.forEach((field, i) => field.onChange(value[i]))
    await when(() => state.validated)
    state.reset()

    expect(state.value).toEqual(initialValue)
    state.$.forEach((field, i) => {
      expect(field.$).toBe(initialValue[i])
    })
    expect(state.dirty).toBe(false)

    state.dispose()
  })
})

describe('FormState (mode: array) validation', () => {
  it('should work well when initialized', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    expect(state.validating).toBe(false)
    expect(state.validated).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with fields onChange()', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    state.$[1].onChange('456')

    await validateFinished(state)
    expect(state.$[1].validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with validate()', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    state.validate()

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields change', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')

    state.$.push(createFieldState('456'))
    // 如果不手动调用 validate()，新增 field 可能一直处于初始状态，即 !dirty，从而导致 !form.validated
    state.validate()

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$.splice(0, defaultDelay)

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with reset()', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(list => list.join('').length > 5 && 'too long')
    state.validate()
    await when(() => state.validated)

    state.reset()
    expect(state.value).toEqual(initialValue)
    expect(state.dirty).toBe(false)
    expect(state.validating).toBe(false)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well with multiple validators', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => list.join('').length > 5 && 'too long',
      list => list.length >= 3 && 'too many'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$[1].onChange('456')

    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$.splice(
      1, 1,
      createFieldState(''),
      createFieldState('')
    )

    await validateFinished(state)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.dispose()
  })

  it('should work well with async validator', async () => {
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => list.join('').length > 5 && delay('too long')
    )
    state.validate()

    await when(() => state.validating)
    expect(state.validating).toBe(true)
    expect(state.validated).toBe(false)

    await when(() => state.validated)
    expect(state.validating).toBe(false)
    expect(state.validated).toBe(true)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with mixed sync and async validator', async () => {
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => list.join('').length > 5 && delay('too long'),
      list => list.length >= 3 && 'too many'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$[1].onChange('456')

    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$[0].onChange('')
    state.$.push(createFieldState(''))
    state.validate()

    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.dispose()
  })

  it('should work well with dynamic validator', async () => {
    const options = observable({ checkLength: true })
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => options.checkLength && list.join('').length > 5 && 'too long',
    )

    state.validate()
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    runInAction(() => options.checkLength = false)
    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.checkLength = true)
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.$[1].onChange('')
    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.dispose()
  })

  it('should work well when add validator dynamically', async () => {
    const initialValue = ['123', '', '4']
    const state = new FormState(initialValue.map(
      value => createFieldState(value)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.validators(list => list.length >= 3 && 'too many')
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too many')

    state.$.pop()
    state.$[1].onChange('456')
    await when(() => state.validated)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields\' validating', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    )
    state.validate()

    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBe('empty')
    expect(state.error).toBe('empty')

    state.$[1].onChange('456')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBe('too long')

    state.$[0].onChange('1')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('123')
    state.$[1].onChange('4')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('1234')
    state.$[1].onChange('56')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with fields\' async validating', async () => {
    const notEmpty = (value: string) => value === '' && delay('empty')
    const initialValue = ['123', '']
    const state = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => list.join('').length > 5 && delay('too long', 10)
    )
    state.validate()

    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBe('empty')
    expect(state.error).toBe('empty')

    state.$[1].onChange('456')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBe('too long')

    state.$[0].onChange('1')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('123')
    state.$[1].onChange('4')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBeUndefined()

    state.$[0].onChange('1234')
    state.$[1].onChange('56')
    await when(() => state.validated)
    expect(state.$[0].error).toBeUndefined()
    expect(state.$[1].error).toBeUndefined()
    expect(state.error).toBe('too long')

    state.dispose()
  })

  it('should work well with disableValidationWhen', async () => {
    const options = observable({ disabled: false })
    const notEmpty = (value: string) => value === '' && 'empty'
    const initialValue = ['123', '456']
    const state = new FormState(initialValue.map(
      value => createFieldState(value).validators(notEmpty)
    )).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(
      () => options.disabled
    )

    runInAction(() => options.disabled = true)

    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    state.$[0].onChange('')
    await state.validate()
    expect(state.hasError).toBe(false)
    expect(state.error).toBeUndefined()

    runInAction(() => options.disabled = false)
    expect(state.hasError).toBe(true)
    expect(state.error).toBe('empty')

    state.dispose()
  })
})

describe('nested FormState', () => {
  it('should work well', async () => {
    const notEmpty = (value: string) => value === '' && 'empty'

    const enabledState = createFieldState(true)

    const shouldDisableInputsState = () => !enabledState.$

    const inputsState = new FormState<FieldState<string>[]>([]).validators(
      list => list.join('').length > 5 && 'too long'
    ).disableValidationWhen(shouldDisableInputsState)

    const state = new FormState({
      inputs: inputsState,
      enabled: enabledState
    })

    const createInputDuplicateValidator = (currentInputState: FieldState<string>) => (value: string) => {
      for (const inputState of state.$.inputs.$) {
        if (inputState !== currentInputState && value === inputState.$) {
          return 'duplicated'
        }
      }
    }

    const createInputState = (initialValue: string) => {
      const inputState = createFieldState(initialValue).validators(notEmpty)
      const duplicateValidator = createInputDuplicateValidator(inputState)
      return inputState.validators(duplicateValidator)
    }

    state.$.inputs.$.push(
      createInputState(''),
      createInputState('')
    )

    await state.validate()
    expect(state.error).toBe('empty')
    expect(state.$.inputs.$[0].error).toBe('empty')
    expect(state.$.inputs.$[1].error).toBe('empty')

    state.$.inputs.$[0].onChange('123')
    state.$.inputs.$[1].onChange('456')

    await state.validate()
    expect(state.error).toBe('too long')
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBeUndefined()

    state.$.enabled.onChange(false)

    await delay()
    expect(state.error).toBeUndefined()

    state.$.enabled.onChange(true)
    state.$.inputs.$[1].onChange('')

    await delay()
    expect(state.error).toBe('empty')
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBe('empty')

    state.$.inputs.$[1].onChange('4')
    state.$.inputs.$.push(createFieldState('56'))

    await delay()
    expect(state.error).toBe('too long')
    expect(state.$.inputs.$[0].error).toBeUndefined()
    expect(state.$.inputs.$[1].error).toBeUndefined()
    expect(state.$.inputs.$[2].error).toBeUndefined()
  })
})
