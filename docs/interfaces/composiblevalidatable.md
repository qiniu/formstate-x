[formstate-x](../README.md) › [ComposibleValidatable](composiblevalidatable.md)

# Interface: ComposibleValidatable <**T, TValue**>

Composible validatable object (which can be used as a field for `FormState`).

## Type parameters

▪ **T**

▪ **TValue**

## Hierarchy

* [Validatable](validatable.md)‹T, TValue›

  ↳ **ComposibleValidatable**

## Implemented by

* [FieldState](../classes/fieldstate.md)
* [FormState](../classes/formstate.md)

## Index

### Properties

* [$](composiblevalidatable.md#$)
* [_activated](composiblevalidatable.md#_activated)
* [_validateStatus](composiblevalidatable.md#_validatestatus)
* [dirty](composiblevalidatable.md#dirty)
* [dispose](composiblevalidatable.md#dispose)
* [error](composiblevalidatable.md#optional-error)
* [hasError](composiblevalidatable.md#haserror)
* [reset](composiblevalidatable.md#reset)
* [validated](composiblevalidatable.md#validated)
* [validating](composiblevalidatable.md#validating)
* [value](composiblevalidatable.md#value)

### Methods

* [validate](composiblevalidatable.md#validate)

## Properties

###  $

• **$**: *T*

*Inherited from [Validatable](validatable.md).[$](validatable.md#$)*

*Defined in [types.ts:31](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L31)*

___

###  _activated

• **_activated**: *boolean*

*Defined in [types.ts:49](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L49)*

___

###  _validateStatus

• **_validateStatus**: *[ValidateStatus](../enums/validatestatus.md)*

*Defined in [types.ts:50](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L50)*

___

###  dirty

• **dirty**: *boolean*

*Defined in [types.ts:48](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L48)*

___

###  dispose

• **dispose**: *function*

*Defined in [types.ts:47](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L47)*

#### Type declaration:

▸ (): *void*

___

### `Optional` error

• **error**? : *string | null | undefined*

*Inherited from [Validatable](validatable.md).[error](validatable.md#optional-error)*

*Defined in [types.ts:34](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L34)*

___

###  hasError

• **hasError**: *boolean*

*Inherited from [Validatable](validatable.md).[hasError](validatable.md#haserror)*

*Defined in [types.ts:33](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L33)*

___

###  reset

• **reset**: *function*

*Defined in [types.ts:46](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L46)*

#### Type declaration:

▸ (): *void*

___

###  validated

• **validated**: *boolean*

*Inherited from [Validatable](validatable.md).[validated](validatable.md#validated)*

*Defined in [types.ts:36](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L36)*

___

###  validating

• **validating**: *boolean*

*Inherited from [Validatable](validatable.md).[validating](validatable.md#validating)*

*Defined in [types.ts:35](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L35)*

___

###  value

• **value**: *TValue*

*Inherited from [Validatable](validatable.md).[value](validatable.md#value)*

*Defined in [types.ts:32](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L32)*

## Methods

###  validate

▸ **validate**(): *Promise‹object | object›*

*Inherited from [Validatable](validatable.md).[validate](validatable.md#validate)*

*Defined in [types.ts:37](https://github.com/qiniu/formstate-x/blob/4d17690/src/types.ts#L37)*

**Returns:** *Promise‹object | object›*
