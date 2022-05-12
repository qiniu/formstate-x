import { isObservableArray, IObservableArray } from 'mobx'
import { Validator, ValidationResult, ValidatorReturned, ValidationError, ValidationErrorObject, ValidationRawError } from './types'

export function normalizeRawError(err: ValidationResult): ValidationRawError {
  if (isErrorObject(err)) {
    return err
  }

  if (err === false || err === '' || err === null) {
    // TODO: print an alert?
    return undefined
  }

  return err
}

export function normalizeError(rawError: ValidationRawError): ValidationError {
  if (isErrorObject(rawError)) {
    return rawError.message
  }
  return rawError
}

export function isErrorObject(err: any): err is ValidationErrorObject {
  return err != null && typeof err === 'object' && 'message' in err
}

export function isPromiseLike(arg: any): arg is Promise<any> {
  return arg != null && typeof arg === 'object' && typeof arg.then === 'function'
}

export function isValidationPassed(result: ValidationResult): result is undefined {
  return normalizeRawError(result) === undefined
}

export function asyncResultsAnd(asyncResults: Array<Promise<ValidationResult>>): ValidatorReturned {
  if (asyncResults.length === 0) {
    return null
  }
  return new Promise(resolve => {
    let validResultCount = 0
    asyncResults.forEach(asyncResult => asyncResult.then(result => {
      // return error if any result is invalid
      if (!isValidationPassed(result)) {
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
    if (!isValidationPassed(returned)) {
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
