import { observable, computed, action, makeObservable } from 'mobx'
import { IState, ValidateStatus } from './types'
import { is } from './utils'
import HasValueAndValidators from './state'

/**
 * The state for a field.
 */
export default class FieldState<V> extends HasValueAndValidators<V> implements IState<V> {

  @observable.ref value!: V

  @computed get error() {
    return this.validationDisabled ? undefined : this._error
  }

  @action onChange(value: V) {
    this.value = value
    this.activated = true
  }

  @action set(value: V) {
    this.value = value
  }

  @action resetWith(initialValue: V) {
    this.value = this.initialValue = initialValue
    this.activated = false
    this.rawValidateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
  }

  dirtyWith(initialValue: V) {
    return !is(this.value, initialValue)
  }

  constructor(public initialValue: V) {
    super()
    makeObservable(this)
    this.reset()
    this.init()
  }
}
