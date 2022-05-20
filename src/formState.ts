import { observable, computed, isObservable, action, reaction, makeObservable, override } from 'mobx'
import { IState, ValidateStatus, ValidateResult, ValueOfStatesObject } from './types'
import { ValidatableState } from './state'
import { isValidationPassed } from './utils'

abstract class AbstractFormState<T, V> extends ValidatableState<V> implements IState<V> {

  /** Reference of child states. */
  abstract readonly $: T

  /** List of child states. */
  protected abstract childStates: IState[]

  @override override get validateStatus() {
    if (this.disabled) {
      return ValidateStatus.WontValidate
    }
    const childStates = this.childStates.filter(
      state => state.validateStatus != ValidateStatus.WontValidate
    )
    if (
      this._validateStatus === ValidateStatus.Validating
      || childStates.some(state => state.validateStatus === ValidateStatus.Validating)
    ) {
      return ValidateStatus.Validating
    }
    if (
      this._validateStatus === ValidateStatus.Validated
      && childStates.every(state => state.validateStatus === ValidateStatus.Validated)
    ) {
      return ValidateStatus.Validated
    }
    return ValidateStatus.NotValidated
  }

  /** The error info of validation (including child states' error info). */
  @override override get error() {
    if (this.disabled) {
      return undefined
    }
    if (this.ownError) {
      return this.ownError
    }
    for (const state of this.childStates) {
      if (state.error) {
        return state.error
      }
    }
  }

  @override override get hasError() {
    if (this.disabled) {
      return false
    }
    if (!isValidationPassed(this.rawError)) {
      return true
    }
    for (const state of this.childStates) {
      if (state.hasError) {
        return true
      }
    }
    return false
  }

  /** If reference of child states has been touched. */
  @observable protected ownTouched = false

  @computed get touched() {
    return (
      this.ownTouched
      || this.childStates.some(state => state.touched)
    )
  }

  /** Reset child states. */
  protected abstract resetChildStates(): void

  @override override reset() {
    super.reset()
    this.ownTouched = false
    this.resetChildStates()
  }

  override async validate(): Promise<ValidateResult<V>> {
    if (this.disabled) {
      return this.validateResult
    }

    await Promise.all([
      ...this.childStates.map(
        state => state.validate()
      ),
      super.validate()
    ])
    return this.validateResult
  }

  protected override init() {
    super.init()

    // auto activate: any child activated -> form activated
    this.addDisposer(reaction(
      () => this.childStates.some(state => state.activated),
      someFieldActivated => someFieldActivated && !this.activated && (this.activated = true),
      { fireImmediately: true, name: 'activate-form-when-child-activated' }
    ))

    // dispose child states when dispose
    this.addDisposer(() => {
      this.childStates.forEach(
        state => state.dispose()
      )
    })
  }

  constructor() {
    super()
    makeObservable(this)
  }
}

/** Object, whose values are states */
export type StatesObject = { [key: string]: IState }

/**
 * The state for a form (object composition of child states).
 */
export class FormState<
  TStates extends StatesObject
> extends AbstractFormState<
  TStates, ValueOfStatesObject<TStates>
> {

  @observable.ref readonly $: Readonly<TStates>

  @computed protected get childStates(): IState[] {
    const states = this.$
    return Object.keys(states).map(
      key => states[key]
    )
  }

  protected resetChildStates() {
    this.childStates.forEach(state => state.reset())
  }

  @computed get value(): ValueOfStatesObject<TStates> {
    const states = this.$
    return Object.keys(states).reduce(
      (value, key) => ({
        ...value,
        [key]: states[key].value
      }),
      {}
    ) as any
  }

  @action set(value: ValueOfStatesObject<TStates>) {
    const states = this.$
    Object.keys(states).forEach(key => {
      states[key].set(value[key])
    })
  }

  @action onChange(value: ValueOfStatesObject<TStates>) {
    const states = this.$
    Object.keys(states).forEach(key => {
      states[key].onChange(value[key])
    })
  }

  constructor(states: TStates) {
    super()
    makeObservable(this)

    if (!isObservable(states)) {
      states = observable(states, undefined, { deep: false })
    }
    this.$ = states

    this.init()
  }
}

/**
 * The state for a array form (list of child states).
 */
export class ArrayFormState<
  V, T extends IState<V> = IState<V>
> extends AbstractFormState<
  readonly T[], V[]
> {

  @observable.ref protected childStates: T[]

  @computed get $(): readonly T[] {
    return this.childStates
  }

  private createChildStates(value: V[]): T[] {
    return observable(
      value.map(this.createChildState),
      undefined,
      { deep: false }
    )
  }

  @action protected resetChildStates() {
    const states = this.childStates
    states.splice(0).forEach(state => {
      state.dispose()
    })
    states.push(...this.createChildStates(this.initialValue))
  }

  @computed get value(): V[] {
    return this.childStates.map(
      state => state.value
    )
  }

  private _remove(fromIndex: number, num: number) {
    this.childStates.splice(fromIndex, num).forEach(state => {
      state.dispose()
    })
    this.ownTouched = true
  }

  private _insert(fromIndex: number, ...childValues: V[]) {
    const states = childValues.map(this.createChildState)
    this.childStates.splice(fromIndex, 0, ...states)
    this.ownTouched = true
  }

  private _set(value: V[], withOnChange = false) {
    let i = 0
    // items exists in both value & child states => do state change 
    for (; i < value.length && i < this.childStates.length; i++) {
      if (withOnChange) this.childStates[i].onChange(value[i])
      else this.childStates[i].set(value[i])
    }
    // items only exists in child states => truncate
    if (i < this.childStates.length) {
      this._remove(i, this.childStates.length - i)
    }
    // items exists in value but not in child states => add
    if (i < value.length) {
      this._insert(i, ...value.slice(i))
    }
  }

  @action set(value: V[]) {
    this._set(value)
  }

  @action onChange(value: V[]) {
    this._set(value, true)
    this.activated = true
  }
  
  /**
   * remove child states
   * @param fromIndex index of first child state to remove
   * @param num number of child states to remove
   */
  @action remove(fromIndex: number, num = 1) {
    if (num <= 0) return
    this._remove(fromIndex, num)
    this.activated = true
  }

  /**
   * insert child states
   * @param fromIndex index of first child state to insert
   * @param ...childStateValues child state values to insert
   */
  @action insert(fromIndex: number, childValue: V, ...moreChildValues: V[]) {
    this._insert(fromIndex, childValue, ...moreChildValues)
    this.activated = true
  }

  /**
   * append child states to the end of child state list
   * @param ...childStateValues child state values to append
   */
  @action append(childValue: V, ...moreChildValues: V[]) {
    this._insert(this.childStates.length, childValue, ...moreChildValues)
    this.activated = true
  }

  /**
   * move child state from one index to another
   * @param fromIndex index of child state to move
   * @param toIndex index to move to
   */
  @action move(fromIndex: number, toIndex: number) {
    if (fromIndex < 0) fromIndex = this.childStates.length + fromIndex
    if (toIndex < 0) toIndex = this.childStates.length + toIndex
    if (fromIndex === toIndex) return

    const [state] = this.childStates.splice(fromIndex, 1)
    this.childStates.splice(toIndex, 0, state)
    this.ownTouched = true
    this.activated = true
  }

  constructor(private initialValue: V[], private createChildState: (v: V) => T) {
    super()
    makeObservable(this)

    this.childStates = this.createChildStates(this.initialValue)
    this.init()
  }
}
