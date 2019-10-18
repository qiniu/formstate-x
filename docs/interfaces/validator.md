[formstate-x](../README.md) › [Validator](validator.md)

# Interface: Validator <**TValue**>

A validator simply takes a value and returns a string or Promise<string>
If a truthy string is returned it represents a validation error

## Type parameters

▪ **TValue**

## Hierarchy

* **Validator**

## Callable

▸ (`value`: TValue): *[ValidatorResponse](../README.md#validatorresponse)*

*Defined in [types.ts:25](https://github.com/qiniu/formstate-x/blob/ad577cd/src/types.ts#L25)*

A validator simply takes a value and returns a string or Promise<string>
If a truthy string is returned it represents a validation error

**Parameters:**

Name | Type |
------ | ------ |
`value` | TValue |

**Returns:** *[ValidatorResponse](../README.md#validatorresponse)*
