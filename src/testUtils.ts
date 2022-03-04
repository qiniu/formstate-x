export const defaultDelay = 10
export const stableDelay = defaultDelay * 3 // [onChange debounce] + [async validate] + [buffer]

export async function delay(millisecond: number = stableDelay) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), millisecond))
}

export async function delayValue<T>(value: T, millisecond: number = defaultDelay) {
  await delay(millisecond)
  return value
}

export function assertType<T>(_v: T) {}

// https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796
export type Equal<X, Y> = (
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2)
  ? true
  : false
)

export function assertTypeEqual<T, S>(..._args: Equal<T, S> extends true ? [] : [never]) {}
