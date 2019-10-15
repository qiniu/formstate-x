import { Validator, ValidationResponse, ValidatorResponse, InputBinds } from "./types"
import FieldState from './fieldState'

export function isPromiseLike(arg: any): arg is Promise<any> {
  return arg != null && typeof arg === 'object' && typeof arg.then === 'function'
}

export function isEmpty(response: ValidationResponse): boolean {
  return !response
}

export function asyncResponsesAnd(asyncResponses: Array<Promise<ValidationResponse>>): ValidatorResponse {
  if (asyncResponses.length === 0) {
    return null
  }
  return new Promise(resolve => {
    // 任一不通过，则不通过
    asyncResponses.forEach(asyncResponse => asyncResponse.then(Response => {
      if (!isEmpty(Response)) {
        resolve(Response)
      }
    }))
    // 所有都通过，则通过
    return Promise.all(asyncResponses).then(responses => {
      if (responses.every(isEmpty)) {
        resolve(null)
      }
    })
  })
}

export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]) {
  if (validators.length === 0) {
    return null
  }

  if (validators.length === 1) {
    return validators[0](value)
  }

  const asyncResponses: Array<Promise<ValidationResponse>> = []

  for (const validator of validators) {
    const response = validator(value)

    if (isPromiseLike(response)) {
      asyncResponses.push(response)
      continue
    }

    // 任一不通过，则不通过
    if (!isEmpty(response)) {
      return response
    }
  }

  return asyncResponsesAnd(asyncResponses)
}

// 基础绑定函数，默认使用传入 onChange 的参数值作为 value
// 注意：若直接展开使用这个方法，那么每次都会生成新的 onChange 引用
// TODO: cache onChange
export function bindInput<T>(state: FieldState<T>): InputBinds<T>
export function bindInput<T, E>(state: FieldState<T>, getValue: (e: E) => T): InputBinds<T, E>
export function bindInput(state: any, getValue?: any) {
  return {
    value: state._value,
    onChange: (arg: any) => state.onChange(
      getValue ? getValue(arg) : arg
    )
  }
}
