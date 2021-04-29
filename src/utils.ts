import { isObservableArray, IObservableArray } from 'mobx'
import { Validator, ValidationResponse, ValidatorResponse } from './types'

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

export function debounce(fn: () => void, delay: number) {
  let timeout: any = null
  return () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(fn, delay)
  }
}

export function isArrayLike(value: unknown): value is unknown[] | IObservableArray {
  return Array.isArray(value) || isObservableArray(value)
}

export function arrayShallowEqual<T>(src: T[], target: T[]) {
  return (
    src.length === target.length
    && src.every((s, i) => s === target[i])
  )
}

export function objectShallowEqual<T extends Record<string, unknown>>(src: T, target: T): boolean {
  const srcKeys = Object.keys(src)
  const targetKeys = Object.keys(target)
  return (
    srcKeys.length === targetKeys.length
    && srcKeys.every(key => src[key] === target[key])
  )
}
