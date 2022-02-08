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

  @action reset() {
    this.value = this.initialValue
    this.activated = false
    this.rawValidateStatus = ValidateStatus.NotValidated
    this._error = undefined
    this.validation = undefined
  }

  @computed get dirty() {
    return !is(this.value, this.initialValue)
  }

  constructor(private initialValue: V) {
    super()
    makeObservable(this)
    this.reset()
    this.init()
  }
}
