[formstate-x](../README.md) › [FormState](formstate.md)

# Class: FormState <**TFields, TValue**>

The state for a form (composition of fields).

## Type parameters

▪ **TFields**: *[ValidatableFields](../README.md#validatablefields)*

▪ **TValue**

## Hierarchy

* [Disposable](disposable.md)

  ↳ **FormState**

## Implements

* [ComposibleValidatable](../interfaces/composiblevalidatable.md)‹TFields, TValue›

## Index

### Constructors

* [constructor](formstate.md#constructor)

### Properties

* [$](formstate.md#$)
* [_validateStatus](formstate.md#_validatestatus)

### Accessors

* [_activated](formstate.md#_activated)
* [dirty](formstate.md#dirty)
* [error](formstate.md#error)
* [hasError](formstate.md#haserror)
* [validated](formstate.md#validated)
* [validating](formstate.md#validating)
* [validationDisabled](formstate.md#validationdisabled)
* [value](formstate.md#value)

### Methods

* [disableValidationWhen](formstate.md#disablevalidationwhen)
* [dispose](formstate.md#dispose)
* [reset](formstate.md#reset)
* [setError](formstate.md#seterror)
* [validate](formstate.md#validate)
* [validators](formstate.md#validators)

## Constructors

###  constructor

\+ **new FormState**(`initialFields`: TFields): *[FormState](formstate.md)*

*Overrides [Disposable](disposable.md).[constructor](disposable.md#constructor)*

*Defined in [formState.ts:270](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L270)*

**Parameters:**

Name | Type |
------ | ------ |
`initialFields` | TFields |

**Returns:** *[FormState](formstate.md)*

## Properties

###  $

• **$**: *TFields*

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md).[$](../interfaces/composiblevalidatable.md#$)*

*Defined in [formState.ts:45](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L45)*

Fields.

___

###  _validateStatus

• **_validateStatus**: *[ValidateStatus](../enums/validatestatus.md)* =  ValidateStatus.NotValidated

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md).[_validateStatus](../interfaces/composiblevalidatable.md#_validatestatus)*

*Defined in [formState.ts:83](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L83)*

The validate status.

## Accessors

###  _activated

• **get _activated**(): *boolean*

*Defined in [formState.ts:27](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L27)*

If activated (with auto validate).
Form will only be activated when some field activated.

**Returns:** *boolean*

___

###  dirty

• **get dirty**(): *boolean*

*Defined in [formState.ts:36](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L36)*

If value has been touched.

**Returns:** *boolean*

___

###  error

• **get error**(): *undefined | string*

*Defined in [formState.ts:106](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L106)*

The error info of validation (including fields' error info).

**Returns:** *undefined | string*

___

###  hasError

• **get hasError**(): *boolean*

*Defined in [formState.ts:123](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L123)*

If the state contains error.

**Returns:** *boolean*

___

###  validated

• **get validated**(): *boolean*

*Defined in [formState.ts:131](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L131)*

If the validation has been done.
It does not means validation passed.

**Returns:** *boolean*

___

###  validating

• **get validating**(): *boolean*

*Defined in [formState.ts:88](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L88)*

If the state is doing a validation.

**Returns:** *boolean*

___

###  validationDisabled

• **get validationDisabled**(): *boolean*

*Defined in [formState.ts:232](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L232)*

If validation disabled.

**Returns:** *boolean*

___

###  value

• **get value**(): *TValue*

*Defined in [formState.ts:64](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L64)*

Value that can be consumed by your code.
It's a composition of fields' value.

**Returns:** *TValue*

## Methods

###  disableValidationWhen

▸ **disableValidationWhen**(`predict`: function): *this*

*Defined in [formState.ts:239](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L239)*

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

###  reset

▸ **reset**(): *void*

*Defined in [formState.ts:172](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L172)*

Reset to initial status.

**Returns:** *void*

___

###  setError

▸ **setError**(`error`: [ValidationResponse](../README.md#validationresponse)): *void*

*Defined in [formState.ts:143](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L143)*

Set error info of form.

**Parameters:**

Name | Type |
------ | ------ |
`error` | [ValidationResponse](../README.md#validationresponse) |

**Returns:** *void*

___

###  validate

▸ **validate**(): *Promise‹object | object›*

*Implementation of [ComposibleValidatable](../interfaces/composiblevalidatable.md)*

*Defined in [formState.ts:207](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L207)*

Fire a validation behavior.

**Returns:** *Promise‹object | object›*

___

###  validators

▸ **validators**(...`validators`: [Validator](../interfaces/validator.md)‹TValue›[]): *this*

*Defined in [formState.ts:155](https://github.com/qiniu/formstate-x/blob/d29c1fc/src/formState.ts#L155)*

Add validator function.

**Parameters:**

Name | Type |
------ | ------ |
`...validators` | [Validator](../interfaces/validator.md)‹TValue›[] |

**Returns:** *this*
