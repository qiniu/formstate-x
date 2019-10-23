[formstate-x](README.md)

# formstate-x

## Index

### Enumerations

* [ValidateStatus](enums/validatestatus.md)

### Classes

* [Disposable](classes/disposable.md)
* [FieldState](classes/fieldstate.md)
* [FormState](classes/formstate.md)

### Interfaces

* [ComposibleValidatable](interfaces/composiblevalidatable.md)
* [Disposer](interfaces/disposer.md)
* [InputBindings](interfaces/inputbindings.md)
* [Validatable](interfaces/validatable.md)
* [Validator](interfaces/validator.md)
* [ValueArrayOf](interfaces/valuearrayof.md)

### Type aliases

* [FieldsArray](README.md#fieldsarray)
* [FieldsObject](README.md#fieldsobject)
* [ValidatableFields](README.md#validatablefields)
* [Validated](README.md#validated)
* [ValidationResponse](README.md#validationresponse)
* [ValidatorResponse](README.md#validatorresponse)
* [ValueOf](README.md#valueof)
* [ValueOfArrayFields](README.md#valueofarrayfields)
* [ValueOfFieldState](README.md#valueoffieldstate)
* [ValueOfFields](README.md#valueoffields)
* [ValueOfObjectFields](README.md#valueofobjectfields)

### Functions

* [bindInput](README.md#bindinput)

## Type aliases

###  FieldsArray

Ƭ **FieldsArray**: *[ComposibleValidatable](interfaces/composiblevalidatable.md)‹any›[]*

*Defined in [formState.ts:9](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/formState.ts#L9)*

Mode: array

___

###  FieldsObject

Ƭ **FieldsObject**: *object*

*Defined in [formState.ts:7](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/formState.ts#L7)*

Mode: object

#### Type declaration:

* \[ **key**: *string*\]: [ComposibleValidatable](interfaces/composiblevalidatable.md)‹any›

___

###  ValidatableFields

Ƭ **ValidatableFields**: *[FieldsObject](README.md#fieldsobject) | [FieldsArray](README.md#fieldsarray)*

*Defined in [formState.ts:11](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/formState.ts#L11)*

Each key of the object is a validatable

___

###  Validated

Ƭ **Validated**: *object*

*Defined in [types.ts:16](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L16)*

#### Type declaration:

___

###  ValidationResponse

Ƭ **ValidationResponse**: *string | null | undefined | false*

*Defined in [types.ts:5](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L5)*

A truthy string or falsy values.

___

###  ValidatorResponse

Ƭ **ValidatorResponse**: *[ValidationResponse](README.md#validationresponse) | Promise‹[ValidationResponse](README.md#validationresponse)›*

*Defined in [types.ts:12](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L12)*

The return value of a validator.

___

###  ValueOf

Ƭ **ValueOf**: *State extends FormState<infer Fields, infer Fields extends { [key: string]: ComposibleValidatable<any, any>; } ? ValueOfObjectFields<infer Fields> : infer Fields extends (infer Field)[] ? ValueArrayOf<Field> : never> ? Fields extends { ...; } ? ValueOfObjectFields<...> : Fields extends (infer Field)[] ? ValueArrayOf...*

*Defined in [types.ts:91](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L91)*

Value of state (`FormState` or `FieldState`)

___

###  ValueOfArrayFields

Ƭ **ValueOfArrayFields**: *Fields extends (infer Field)[] ? ValueArrayOf<Field> : never*

*Defined in [types.ts:77](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L77)*

Value of array-fields.

___

###  ValueOfFieldState

Ƭ **ValueOfFieldState**: *State extends FieldState<infer FieldType> ? FieldType : never*

*Defined in [types.ts:60](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L60)*

Value of `FieldState`.

___

###  ValueOfFields

Ƭ **ValueOfFields**: *Fields extends { [key: string]: ComposibleValidatable<any, any>; } ? ValueOfObjectFields<Fields> : Fields extends (infer Field)[] ? ValueArrayOf<Field> : never*

*Defined in [types.ts:84](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L84)*

Value of fields.

___

###  ValueOfObjectFields

Ƭ **ValueOfObjectFields**: *object*

*Defined in [types.ts:72](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/types.ts#L72)*

Value of object-fields.

#### Type declaration:

## Functions

###  bindInput

▸ **bindInput**<**T**>(`state`: [FieldState](classes/fieldstate.md)‹T›): *[InputBindings](interfaces/inputbindings.md)‹T›*

*Defined in [bind.ts:16](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/bind.ts#L16)*

Helper method to bind state to your input component.
You can define your own bindInput by specifying `getValue`.

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type |
------ | ------ |
`state` | [FieldState](classes/fieldstate.md)‹T› |

**Returns:** *[InputBindings](interfaces/inputbindings.md)‹T›*

▸ **bindInput**<**T**, **E**>(`state`: [FieldState](classes/fieldstate.md)‹T›, `getValue`: function): *[InputBindings](interfaces/inputbindings.md)‹T, E›*

*Defined in [bind.ts:17](https://github.com/qiniu/formstate-x/blob/ccc96d5/src/bind.ts#L17)*

**Type parameters:**

▪ **T**

▪ **E**

**Parameters:**

▪ **state**: *[FieldState](classes/fieldstate.md)‹T›*

▪ **getValue**: *function*

▸ (`e`: E): *T*

**Parameters:**

Name | Type |
------ | ------ |
`e` | E |

**Returns:** *[InputBindings](interfaces/inputbindings.md)‹T, E›*
