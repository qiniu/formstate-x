import { action, computed, makeObservable } from 'mobx'
import * as v2 from 'formstate-x-v2'
import { BaseState } from '../state'
import * as v3 from '..'

interface IV3StateFromV2<T extends v2.ComposibleValidatable<unknown, V>, V> extends v3.IState<V> {
  /** The original (formstate-x@v2.x) state */
  $: T
}

class Upgrader<T extends v2.ComposibleValidatable<unknown, V>, V> implements IV3StateFromV2<T, V> {
  constructor(private stateV2: T) {
    makeObservable(this)
  }

  /** The original (formstate-x@v2.x) state */
  @computed get $() { return this.stateV2 }

  @computed get value() { return this.stateV2.value }
  @computed get dirty() { return this.stateV2.dirty }
  @computed get error() { return this.stateV2.error }
  @computed get activated() { return this.stateV2._activated }
  @computed get validateStatus() {
    return getV3ValidateStatus(this.stateV2)
  }
  validate() {
    return this.stateV2.validate() as Promise<v3.ValidateResult<V>>
  }
  @action onChange(value: V) {
    onChangeForV2(this.stateV2, value)
  }
  @action set(value: V) {
    setForV2(this.stateV2, value)
  }
  reset() { this.stateV2.reset() }
  validators(...validators: Array<v3.Validator<V>>) {
    if (
      isV2FieldState(this.stateV2)
      || isV2FormState(this.stateV2)
    ) {
      this.stateV2.validators(...validators)
      return this
    }
    throwNotSupported()
  }
  disableValidationWhen(predict: () => boolean) {
    if (
      isV2FieldState(this.stateV2)
      || isV2FormState(this.stateV2)
    ) {
      this.stateV2.disableValidationWhen(predict)
      return this
    }
    throwNotSupported()
  }
  dispose() { this.stateV2.dispose() }
}

/** Convets formstate-x@v2.x state to formstate-x@v3.x state */
export function fromV2<T extends v2.ComposibleValidatable<unknown, unknown>>(stateV2: T): IV3StateFromV2<T, T['value']> {
  return new Upgrader(stateV2)
}

interface IV2StateFromV3<T extends v3.IState<V>, V> extends v2.ComposibleValidatable<T, V> {
  /** The original (formstate-x@v3.x) state */
  $: T
}

class Downgrader<T extends v3.IState<V>, V> extends BaseState implements IV2StateFromV3<T, V> {
  constructor(private stateV3: T) {
    super()
    makeObservable(this)
  }

  /** The original (formstate-x@v3.x) state */
  @computed get $() { return this.stateV3 }

  @computed get value() { return this.stateV3.value }
  @computed get error() { return this.stateV3.error }

  @computed get validationDisabled() {
    return this.stateV3.validateStatus === v3.ValidateStatus.WontValidate
  }

  validate() { return this.stateV3.validate() }
  reset() { this.stateV3.reset() }

  override dispose() {
    super.dispose()
    this.stateV3.dispose()
  }

  @computed get dirty() { return this.stateV3.dirty }
  @computed get _activated() { return this.stateV3.activated }
  @computed get _validateStatus() {
    return getV2ValidateStatus(this.stateV3)
  }

  // for BaseState
  @computed get validateStatus() {
    return this.stateV3.validateStatus
  }
}

/** Convets formstate-x@v3.x state to formstate-x@v2.x state */
export function toV2<T extends v3.IState<unknown>>(state: T): IV2StateFromV3<T, T['value']> {
  return new Downgrader(state)
}

function getV3ValidateStatus(stateV2: v2.ComposibleValidatable<unknown>): v3.ValidateStatus {
  if (stateV2.validationDisabled) return v3.ValidateStatus.WontValidate
  switch (stateV2._validateStatus) {
    case v2.ValidateStatus.NotValidated:
      return v3.ValidateStatus.NotValidated
    case v2.ValidateStatus.Validating:
      return v3.ValidateStatus.Validating
    case v2.ValidateStatus.Validated:
      return v3.ValidateStatus.Validated
    default:
      throwInvalidValue(stateV2._validateStatus)
  }
}

function getV2ValidateStatus(stateV3: v3.IState): v2.ValidateStatus {
  switch (stateV3.validateStatus) {
    case v3.ValidateStatus.NotValidated:
      return v2.ValidateStatus.NotValidated
    case v3.ValidateStatus.Validating:
      return v2.ValidateStatus.Validating
    case v3.ValidateStatus.Validated:
      return v2.ValidateStatus.Validated
    case v3.ValidateStatus.WontValidate:
      return v2.ValidateStatus.NotValidated
    default:
      throwInvalidValue(stateV3.validateStatus)
  }
}

function isV2FieldState<V>(state: v2.ComposibleValidatable<unknown, V>): state is v2.FieldState<V> {
  return state instanceof v2.FieldState
}

function isV2FormState<V>(state: v2.ComposibleValidatable<unknown, V>): state is v2.FormState<v2.ValidatableFields, V> {
  return state instanceof v2.FormState
}

function throwNotSupported(): never {
  throw new Error('Operation not supported.')
}

function throwInvalidValue(value: never): never {
  throw new Error(`Invalid value occurred: ${value}.`)
}

function onChangeForV2ObjectFormState<V>(state: v2.FormState<v2.FieldsObject, V>, value: V) {
  Object.keys(state.$).forEach(key => {
    onChangeForV2(state.$[key], (value as any)[key])
  })
}

function onChangeForV2FormState<V>(state: v2.FormState<v2.ValidatableFields, V>, value: V) {
  switch (state['mode']) {
    case 'object':
      onChangeForV2ObjectFormState(state as v2.FormState<v2.FieldsObject, V>, value)
      break
    case 'array':
    default:
      throwNotSupported()
  }
}

function onChangeForV2<V>(state: v2.ComposibleValidatable<unknown, V>, value: V) {
  if (isV2FieldState(state)) {
    state.onChange(value)
    return
  }
  if (isV2FormState(state)) {
    onChangeForV2FormState(state, value)
    return
  }
  throwNotSupported()
}

function setForV2ObjectFormState<V>(state: v2.FormState<v2.FieldsObject, V>, value: V) {
  Object.keys(state.$).forEach(key => {
    setForV2(state.$[key], (value as any)[key])
  })
}

function setForV2FormState<V>(state: v2.FormState<v2.ValidatableFields, V>, value: V) {
  switch (state['mode']) {
    case 'object':
      setForV2ObjectFormState(state as v2.FormState<v2.FieldsObject, V>, value)
      break
    case 'array':
    default:
      throwNotSupported()
  }
}

function setForV2<V>(state: v2.ComposibleValidatable<unknown, V>, value: V) {
  if (isV2FieldState(state)) {
    state.set(value)
    return
  }
  if (isV2FormState(state)) {
    setForV2FormState(state, value)
    return
  }
  throwNotSupported()
}
