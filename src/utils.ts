import { isObservableArray, IObservableArray } from 'mobx'
import { Validator, ValidationResult, ValidatorReturned, ErrorObject } from './types'

export function isErrorObject(err: any): err is ErrorObject {
  return err != null && typeof err === 'object' && 'message' in err
}

export function isPromiseLike(arg: any): arg is Promise<any> {
  return arg != null && typeof arg === 'object' && typeof arg.then === 'function'
}

/** If validation result is valid */
export function isValid(result: ValidationResult): result is '' | null | undefined | false {
  return !result
}

export function asyncResultsAnd(asyncResults: Array<Promise<ValidationResult>>): ValidatorReturned {
  if (asyncResults.length === 0) {
    return null
  }
  return new Promise(resolve => {
    let validResultCount = 0
    asyncResults.forEach(asyncResult => asyncResult.then(result => {
      // return error if any result is invalid
      if (!isValid(result)) {
        resolve(result)
        return
      }

      validResultCount++
      // pass if all results are valid
      if (validResultCount === asyncResults.length) {
        resolve(null)
      }
    }))
  })
}

export function applyValidators<TValue>(value: TValue, validators: Validator<TValue>[]) {
  if (validators.length === 0) {
    return null
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
    if (!isValid(returned)) {
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
