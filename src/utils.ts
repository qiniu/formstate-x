import { isObservableArray, IObservableArray } from 'mobx'
import { Validator, ValidatorReturned, ValidationError, ValidationErrorObject, ValidationResult } from './types'

export const inValidErrorObjectMsg = 'ValidationErrorObject message property cannot be empty'

// ValidationResult -> ValidationError
export function normalizeError(result: ValidationResult): ValidationError {
  if (isErrorObject(result)) {
    if (!result.message) {
      throw new Error(inValidErrorObjectMsg)
    }
    return result.message
  }

  if (result === false || result == null || result == '') {
    return undefined
  }

  return result
}

export function isErrorObject(err: any): err is ValidationErrorObject {
  if (err != null && typeof err === 'object' && 'message' in err) {
    return true
  }
  return false
}

export function isPromiseLike(arg: any): arg is Promise<any> {
  return arg != null && typeof arg === 'object' && typeof arg.then === 'function'
}

export function isPassed(result: ValidationResult) {
  return normalizeError(result) === undefined
}

export function asyncResultsAnd(asyncResults: Array<Promise<ValidationResult>>): ValidatorReturned {
  if (asyncResults.length === 0) {
    return undefined
  }
  return new Promise(resolve => {
    let validResultCount = 0
    asyncResults.forEach(asyncResult => asyncResult.then(result => {
      // return error if any validation not passed
      if (!isPassed(result)) {
        resolve(result)
        return
      }

      validResultCount++
      // pass if all results are valid
      if (validResultCount === asyncResults.length) {
        resolve(undefined)
      }
    }))
  })
}

export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]) {
  if (validators.length === 0) {
    return undefined
  }

  if (validators.length === 1) {
    return validators[0](value)
  }

  const asyncResults: Array<Promise<ValidationResult>> = []

  for (const validator of validators) {
    const returned = validator(value)

    if (isPromiseLike(returned)) {
      asyncResults.push(returned)
      continue
    }

    // 任一不通过，则不通过
    if (!isPassed(returned)) {
      return returned
    }
  }

  return asyncResultsAnd(asyncResults)
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
