import { observable, action, makeObservable, override } from 'mobx'
import { IState } from './types'
import { ValidatableState } from './state'

/**
 * The state for a field.
 */
export class FieldState<V> extends ValidatableState<V> implements IState<V> {

  @observable.ref value!: V

  @observable touched = false

  @action onChange(value: V) {
    this.value = value
    this.activated = true
    this.touched = true
  }

  @action set(value: V) {
    this.value = value
    this.touched = true
  }

  @override override reset() {
    super.reset()
    this.value = this.initialValue
    this.touched = false
  }

  constructor(protected initialValue: V) {
    super()
    makeObservable(this)
    this.reset()
    this.init()
  }
}
