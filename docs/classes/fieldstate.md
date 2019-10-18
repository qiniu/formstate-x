[formstate-x](../README.md) › [FieldState](fieldstate.md)

# Class: FieldState <**TValue**>

The state for a field.

## Type parameters

▪ **TValue**

## Hierarchy

* [Disposable](disposable.md)

  ↳ **FieldState**

## Implements

* [ComposibleValidatable](../interfaces/composiblevalidatable.md)‹TValue›

## Index

### Constructors

* [constructor](fieldstate.md#constructor)

### Properties

* [$](fieldstate.md#$)
* [_activated](fieldstate.md#_activated)
* [_error](fieldstate.md#optional-_error)
* [_validateStatus](fieldstate.md#_validatestatus)
* [_value](fieldstate.md#_value)
* [value](fieldstate.md#value)

### Accessors

* [dirty](fieldstate.md#dirty)
* [error](fieldstate.md#error)
* [hasError](fieldstate.md#haserror)
* [validated](fieldstate.md#validated)
* [validating](fieldstate.md#validating)
* [validationDisabled](fieldstate.md#validationdisabled)

### Methods

* [disableValidationWhen](fieldstate.md#disablevalidationwhen)
* [dispose](fieldstate.md#dispose)
* [onChange](fieldstate.md#onchange)
* [reset](fieldstate.md#reset)
* [set](fieldstate.md#set)
* [setError](fieldstate.md#seterror)
* [validate](fieldstate.md#validate)
* [validators](fieldstate.md#validators)

## Constructors

###  constructor

\+ **new FieldState**(`initialValue`: TValue, `delay`: number): *[FieldState](fieldstate.md)*

*Overrides [Disposable](disposable.md).[constructor](disposable.md#constructor)*

*Defined in [fieldState.ts:235](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L235)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`initialValue` | TValue | - |
`delay` | number | 200 |

**Returns:** *[FieldState](fieldstate.md)*

## Properties

###  $

• **$**: *TValue*

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md).[$](../interfaces/composiblevalidatable.md#$)*

*Defined in [fieldState.ts:39](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L39)*

Value that has bean validated with no error, AKA "safe".

___

###  _activated

• **_activated**: *boolean* = false

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md).[_activated](../interfaces/composiblevalidatable.md#_activated)*

*Defined in [fieldState.ts:15](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L15)*

If activated (with auto validation).
Field will only be activated when `validate()` or `onChange()` called.

___

### `Optional` _error

• **_error**? : *undefined | string*

*Defined in [fieldState.ts:64](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L64)*

The original error info of validation.

___

###  _validateStatus

• **_validateStatus**: *[ValidateStatus](../enums/validatestatus.md)* =  ValidateStatus.NotValidated

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md).[_validateStatus](../interfaces/composiblevalidatable.md#_validatestatus)*

*Defined in [fieldState.ts:52](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L52)*

The validate status.

___

###  _value

• **_value**: *TValue*

*Defined in [fieldState.ts:28](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L28)*

Value that reacts to `onChange` immediately.
You should only use it to bind with UI input componnet.

___

###  value

• **value**: *TValue*

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md).[value](../interfaces/composiblevalidatable.md#value)*

*Defined in [fieldState.ts:34](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L34)*

Value that can be consumed by your code.
It's synced from `_value` with debounce of 200ms.

## Accessors

###  dirty

• **get dirty**(): *boolean*

*Defined in [fieldState.ts:20](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L20)*

If value has been touched (different with `initialValue`)

**Returns:** *boolean*

___

###  error

• **get error**(): *undefined | string*

*Defined in [fieldState.ts:69](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L69)*

The error info of validation.

**Returns:** *undefined | string*

___

###  hasError

• **get hasError**(): *boolean*

*Defined in [fieldState.ts:76](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L76)*

If the state contains error.

**Returns:** *boolean*

___

###  validated

• **get validated**(): *boolean*

*Defined in [fieldState.ts:84](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L84)*

If the validation has been done.
It does not means validation passed.

**Returns:** *boolean*

___

###  validating

• **get validating**(): *boolean*

*Defined in [fieldState.ts:57](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L57)*

If the state is doing a validation.

**Returns:** *boolean*

___

###  validationDisabled

• **get validationDisabled**(): *boolean*

*Defined in [fieldState.ts:197](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L197)*

If validation disabled.

**Returns:** *boolean*

## Methods

###  disableValidationWhen

▸ **disableValidationWhen**(`predict`: function): *this*

*Defined in [fieldState.ts:204](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L204)*

Configure when to disable validation.

**Parameters:**

▪ **predict**: *function*

▸ (): *boolean*

**Returns:** *this*

___

###  dispose

▸ **dispose**(): *void*

*Inherited from [Disposable](disposable.md).[dispose](disposable.md#dispose)*

*Defined in [disposable.ts:23](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/disposable.ts#L23)*

Do dispose by calling all disposer functions.

**Returns:** *void*

___

###  onChange

▸ **onChange**(`value`: TValue): *void*

*Defined in [fieldState.ts:119](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L119)*

Set `_value` on change event.

**Parameters:**

Name | Type |
------ | ------ |
`value` | TValue |

**Returns:** *void*

___

###  reset

▸ **reset**(): *void*

*Defined in [fieldState.ts:134](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L134)*

Reset to initial status.

**Returns:** *void*

___

###  set

▸ **set**(`value`: TValue): *void*

*Defined in [fieldState.ts:126](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L126)*

Set `value` (& `_value`) synchronously.

**Parameters:**

Name | Type |
------ | ------ |
`value` | TValue |

**Returns:** *void*

___

###  setError

▸ **setError**(`error`: [ValidationResponse](../README.md#validationresponse)): *void*

*Defined in [fieldState.ts:91](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L91)*

Set error info.

**Parameters:**

Name | Type |
------ | ------ |
`error` | [ValidationResponse](../README.md#validationresponse) |

**Returns:** *void*

___

###  validate

▸ **validate**(): *Promise‹object | object›*

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md)*

*Defined in [fieldState.ts:171](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L171)*

Fire a validation behavior.

**Returns:** *Promise‹object | object›*

___

###  validators

▸ **validators**(...`validators`: [Validator](../interfaces/validator.md)‹TValue›[]): *this*

*Defined in [fieldState.ts:103](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/fieldState.ts#L103)*

Add validator function.

**Parameters:**

Name | Type |
------ | ------ |
`...validators` | [Validator](../interfaces/validator.md)‹TValue›[] |

**Returns:** *this*
