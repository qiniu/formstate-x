import { Validatable, ValueOf } from './types'

// https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796
export type Equal<X, Y> = (
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2)
  ? true
  : false
)

function assertEqual<T, S>(..._args: Equal<T, S> extends true ? [] : [never]) {}

describe('ValueOf', () => {
  it('should work well with Validatable', () => {
    const a = {} as Validatable<string>
    assertEqual<ValueOf<typeof a>, string>()
  })
})
