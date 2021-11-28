import FieldState from './fieldState'

const defaultDelay = 10
const stableDelay = defaultDelay * 3 // [onChange debounce] + [async validate] + [buffer]

export async function delay(millisecond: number = stableDelay) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), millisecond))
}

export async function delayValue<T>(value: T, millisecond: number = defaultDelay) {
  await delay(millisecond)
  return value
}

export function assertType<T>(_v: T) {}

export function createFieldState<T>(initialValue: T) {
  return new FieldState(initialValue, defaultDelay)
}
