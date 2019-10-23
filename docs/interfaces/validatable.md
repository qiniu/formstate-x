[formstate-x](../README.md) › [Validatable](validatable.md)

# Interface: Validatable <**T, TValue**>

Validatable object.

## Type parameters

▪ **T**

▪ **TValue**

## Hierarchy

* **Validatable**

  ↳ [ComposibleValidatable](composiblevalidatable.md)

## Index

### Properties

* [$](validatable.md#$)
* [error](validatable.md#optional-error)
* [hasError](validatable.md#haserror)
* [validated](validatable.md#validated)
* [validating](validatable.md#validating)
* [validationDisabled](validatable.md#validationdisabled)
* [value](validatable.md#value)

### Methods

* [validate](validatable.md#validate)

## Properties

###  $

• **$**: *T*

*Defined in [types.ts:31](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L31)*

___

### `Optional` error

• **error**? : *string | null | undefined*

*Defined in [types.ts:34](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L34)*

___

###  hasError

• **hasError**: *boolean*

*Defined in [types.ts:33](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L33)*

___

###  validated

• **validated**: *boolean*

*Defined in [types.ts:36](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L36)*

___

###  validating

• **validating**: *boolean*

*Defined in [types.ts:35](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L35)*

___

###  validationDisabled

• **validationDisabled**: *boolean*

*Defined in [types.ts:37](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L37)*

___

###  value

• **value**: *TValue*

*Defined in [types.ts:32](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L32)*

## Methods

###  validate

▸ **validate**(): *Promise‹object | object›*

*Defined in [types.ts:38](https://github.com/nighca/formstate-x/blob/fca3b10/src/types.ts#L38)*

**Returns:** *Promise‹object | object›*
