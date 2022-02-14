import { observable, computed, action, makeObservable } from 'mobx'
import { IState, ValidateStatus } from './types'
import { is } from './utils'
import { ValidatableState } from './state'

/**
 * The state for a field.
 */
export class FieldState<V> extends ValidatableState<V> implements IState<V> {

  @observable.ref value!: V

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
    this._validateStatus = ValidateStatus.NotValidated
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
