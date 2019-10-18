[formstate-x](../README.md) › [ValueArrayOf](valuearrayof.md)

# Interface: ValueArrayOf <**Field**>

Value Array of given Field.

## Type parameters

▪ **Field**

## Hierarchy

* Array‹[ValueOf](../README.md#valueof)‹Field››

  ↳ **ValueArrayOf**

## Indexable

* \[ **n**: *number*\]: [ValueOf](../README.md#valueof)‹Field›

Value Array of given Field.

## Index

### Properties

* [Array](valuearrayof.md#array)
* [length](valuearrayof.md#length)

### Methods

* [__@iterator](valuearrayof.md#__@iterator)
* [__@unscopables](valuearrayof.md#__@unscopables)
* [concat](valuearrayof.md#concat)
* [copyWithin](valuearrayof.md#copywithin)
* [entries](valuearrayof.md#entries)
* [every](valuearrayof.md#every)
* [fill](valuearrayof.md#fill)
* [filter](valuearrayof.md#filter)
* [find](valuearrayof.md#find)
* [findIndex](valuearrayof.md#findindex)
* [forEach](valuearrayof.md#foreach)
* [includes](valuearrayof.md#includes)
* [indexOf](valuearrayof.md#indexof)
* [join](valuearrayof.md#join)
* [keys](valuearrayof.md#keys)
* [lastIndexOf](valuearrayof.md#lastindexof)
* [map](valuearrayof.md#map)
* [pop](valuearrayof.md#pop)
* [push](valuearrayof.md#push)
* [reduce](valuearrayof.md#reduce)
* [reduceRight](valuearrayof.md#reduceright)
* [reverse](valuearrayof.md#reverse)
* [shift](valuearrayof.md#shift)
* [slice](valuearrayof.md#slice)
* [some](valuearrayof.md#some)
* [sort](valuearrayof.md#sort)
* [splice](valuearrayof.md#splice)
* [toLocaleString](valuearrayof.md#tolocalestring)
* [toString](valuearrayof.md#tostring)
* [unshift](valuearrayof.md#unshift)
* [values](valuearrayof.md#values)

## Properties

###  Array

• **Array**: *ArrayConstructor*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1368

___

###  length

• **length**: *number*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1209

Gets or sets the length of the array. This is a number one higher than the highest element defined in an array.

## Methods

###  __@iterator

▸ **__@iterator**(): *IterableIterator‹[ValueOf](../README.md#valueof)‹Field››*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.iterable.d.ts:52

Iterator

**Returns:** *IterableIterator‹[ValueOf](../README.md#valueof)‹Field››*

___

###  __@unscopables

▸ **__@unscopables**(): *object*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:94

Returns an object whose properties have the value 'true'
when they will be absent when used in a 'with' statement.

**Returns:** *object*

___

###  concat

▸ **concat**(...`items`: ConcatArray‹[ValueOf](../README.md#valueof)‹Field››[]): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1231

Combines two or more arrays.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...items` | ConcatArray‹[ValueOf](../README.md#valueof)‹Field››[] | Additional items to add to the end of array1.  |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

▸ **concat**(...`items`: T | ConcatArray‹T›[]): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1236

Combines two or more arrays.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...items` | T &#124; ConcatArray‹T›[] | Additional items to add to the end of array1.  |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

___

###  copyWithin

▸ **copyWithin**(`target`: number, `start`: number, `end?`: undefined | number): *this*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.core.d.ts:64

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`target` | number | If target is negative, it is treated as length+target where length is the length of the array. |
`start` | number | If start is negative, it is treated as length+start. If end is negative, it is treated as length+end. |
`end?` | undefined &#124; number | If not specified, length of the this object is used as its default value.  |

**Returns:** *this*

___

###  entries

▸ **entries**(): *IterableIterator‹[number, [ValueOf](../README.md#valueof)‹Field›]›*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.iterable.d.ts:57

Returns an iterable of key, value pairs for every entry in the array

**Returns:** *IterableIterator‹[number, [ValueOf](../README.md#valueof)‹Field›]›*

___

###  every

▸ **every**(`callbackfn`: function, `thisArg?`: any): *boolean*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1296

Determines whether all the members of an array satisfy the specified test.

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** *boolean*

___

###  fill

▸ **fill**(`value`: [ValueOf](../README.md#valueof)‹Field›, `start?`: undefined | number, `end?`: undefined | number): *this*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.core.d.ts:53

Returns the this object after filling the section identified by start and end with value

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› | value to fill array section with |
`start?` | undefined &#124; number | index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array. |
`end?` | undefined &#124; number | index to stop filling the array at. If end is negative, it is treated as length+end.  |

**Returns:** *this*

___

###  filter

▸ **filter**<**S**>(`callbackfn`: function, `thisArg?`: any): *S[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1320

Returns the elements of an array that meet the condition specified in a callback function.

**Type parameters:**

▪ **S**: *[ValueOf](../README.md#valueof)‹Field›*

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** *S[]*

▸ **filter**(`callbackfn`: function, `thisArg?`: any): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1326

Returns the elements of an array that meet the condition specified in a callback function.

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

___

###  find

▸ **find**<**S**>(`predicate`: function, `thisArg?`: any): *S | undefined*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.core.d.ts:31

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

**Type parameters:**

▪ **S**: *[ValueOf](../README.md#valueof)‹Field›*

**Parameters:**

▪ **predicate**: *function*

find calls predicate once for each element of the array, in ascending
order, until it finds one where predicate returns true. If such an element is found, find
immediately returns that element value. Otherwise, find returns undefined.

▸ (`this`: void, `value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `obj`: [ValueOf](../README.md#valueof)‹Field›[]): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`this` | void |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`obj` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

If provided, it will be used as the this value for each invocation of
predicate. If it is not provided, undefined is used instead.

**Returns:** *S | undefined*

▸ **find**(`predicate`: function, `thisArg?`: any): *[ValueOf](../README.md#valueof)‹Field› | undefined*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.core.d.ts:32

**Parameters:**

▪ **predicate**: *function*

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `obj`: [ValueOf](../README.md#valueof)‹Field›[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`obj` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

**Returns:** *[ValueOf](../README.md#valueof)‹Field› | undefined*

___

###  findIndex

▸ **findIndex**(`predicate`: function, `thisArg?`: any): *number*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.core.d.ts:43

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

**Parameters:**

▪ **predicate**: *function*

find calls predicate once for each element of the array, in ascending
order, until it finds one where predicate returns true. If such an element is found,
findIndex immediately returns that element index. Otherwise, findIndex returns -1.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `obj`: [ValueOf](../README.md#valueof)‹Field›[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`obj` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

If provided, it will be used as the this value for each invocation of
predicate. If it is not provided, undefined is used instead.

**Returns:** *number*

___

###  forEach

▸ **forEach**(`callbackfn`: function, `thisArg?`: any): *void*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1308

Performs the specified action for each element in an array.

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** *void*

___

###  includes

▸ **includes**(`searchElement`: [ValueOf](../README.md#valueof)‹Field›, `fromIndex?`: undefined | number): *boolean*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2016.array.include.d.ts:27

Determines whether an array includes a certain element, returning true or false as appropriate.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`searchElement` | [ValueOf](../README.md#valueof)‹Field› | The element to search for. |
`fromIndex?` | undefined &#124; number | The position in this array at which to begin searching for searchElement.  |

**Returns:** *boolean*

___

###  indexOf

▸ **indexOf**(`searchElement`: [ValueOf](../README.md#valueof)‹Field›, `fromIndex?`: undefined | number): *number*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1284

Returns the index of the first occurrence of a value in an array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`searchElement` | [ValueOf](../README.md#valueof)‹Field› | The value to locate in the array. |
`fromIndex?` | undefined &#124; number | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.  |

**Returns:** *number*

___

###  join

▸ **join**(`separator?`: undefined | string): *string*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1241

Adds all the elements of an array separated by the specified separator string.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`separator?` | undefined &#124; string | A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.  |

**Returns:** *string*

___

###  keys

▸ **keys**(): *IterableIterator‹number›*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.iterable.d.ts:62

Returns an iterable of keys in the array

**Returns:** *IterableIterator‹number›*

___

###  lastIndexOf

▸ **lastIndexOf**(`searchElement`: [ValueOf](../README.md#valueof)‹Field›, `fromIndex?`: undefined | number): *number*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1290

Returns the index of the last occurrence of a specified value in an array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`searchElement` | [ValueOf](../README.md#valueof)‹Field› | The value to locate in the array. |
`fromIndex?` | undefined &#124; number | The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.  |

**Returns:** *number*

___

###  map

▸ **map**<**U**>(`callbackfn`: function, `thisArg?`: any): *U[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1314

Calls a defined callback function on each element of an array, and returns an array that contains the results.

**Type parameters:**

▪ **U**

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *U*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** *U[]*

___

###  pop

▸ **pop**(): *[ValueOf](../README.md#valueof)‹Field› | undefined*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1221

Removes the last element from an array and returns it.

**Returns:** *[ValueOf](../README.md#valueof)‹Field› | undefined*

___

###  push

▸ **push**(...`items`: [ValueOf](../README.md#valueof)‹Field›[]): *number*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1226

Appends new elements to an array, and returns the new length of the array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...items` | [ValueOf](../README.md#valueof)‹Field›[] | New elements of the Array.  |

**Returns:** *number*

___

###  reduce

▸ **reduce**(`callbackfn`: function): *[ValueOf](../README.md#valueof)‹Field›*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1332

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: [ValueOf](../README.md#valueof)‹Field›, `currentValue`: [ValueOf](../README.md#valueof)‹Field›, `currentIndex`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *[ValueOf](../README.md#valueof)‹Field›*

**Parameters:**

Name | Type |
------ | ------ |
`previousValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentIndex` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›*

▸ **reduce**(`callbackfn`: function, `initialValue`: [ValueOf](../README.md#valueof)‹Field›): *[ValueOf](../README.md#valueof)‹Field›*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1333

**Parameters:**

▪ **callbackfn**: *function*

▸ (`previousValue`: [ValueOf](../README.md#valueof)‹Field›, `currentValue`: [ValueOf](../README.md#valueof)‹Field›, `currentIndex`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *[ValueOf](../README.md#valueof)‹Field›*

**Parameters:**

Name | Type |
------ | ------ |
`previousValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentIndex` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪ **initialValue**: *[ValueOf](../README.md#valueof)‹Field›*

**Returns:** *[ValueOf](../README.md#valueof)‹Field›*

▸ **reduce**<**U**>(`callbackfn`: function, `initialValue`: U): *U*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1339

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Type parameters:**

▪ **U**

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: U, `currentValue`: [ValueOf](../README.md#valueof)‹Field›, `currentIndex`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *U*

**Parameters:**

Name | Type |
------ | ------ |
`previousValue` | U |
`currentValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentIndex` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪ **initialValue**: *U*

If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.

**Returns:** *U*

___

###  reduceRight

▸ **reduceRight**(`callbackfn`: function): *[ValueOf](../README.md#valueof)‹Field›*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1345

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: [ValueOf](../README.md#valueof)‹Field›, `currentValue`: [ValueOf](../README.md#valueof)‹Field›, `currentIndex`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *[ValueOf](../README.md#valueof)‹Field›*

**Parameters:**

Name | Type |
------ | ------ |
`previousValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentIndex` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›*

▸ **reduceRight**(`callbackfn`: function, `initialValue`: [ValueOf](../README.md#valueof)‹Field›): *[ValueOf](../README.md#valueof)‹Field›*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1346

**Parameters:**

▪ **callbackfn**: *function*

▸ (`previousValue`: [ValueOf](../README.md#valueof)‹Field›, `currentValue`: [ValueOf](../README.md#valueof)‹Field›, `currentIndex`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *[ValueOf](../README.md#valueof)‹Field›*

**Parameters:**

Name | Type |
------ | ------ |
`previousValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentIndex` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪ **initialValue**: *[ValueOf](../README.md#valueof)‹Field›*

**Returns:** *[ValueOf](../README.md#valueof)‹Field›*

▸ **reduceRight**<**U**>(`callbackfn`: function, `initialValue`: U): *U*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1352

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

**Type parameters:**

▪ **U**

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.

▸ (`previousValue`: U, `currentValue`: [ValueOf](../README.md#valueof)‹Field›, `currentIndex`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *U*

**Parameters:**

Name | Type |
------ | ------ |
`previousValue` | U |
`currentValue` | [ValueOf](../README.md#valueof)‹Field› |
`currentIndex` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪ **initialValue**: *U*

If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.

**Returns:** *U*

___

###  reverse

▸ **reverse**(): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1245

Reverses the elements in an Array.

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

___

###  shift

▸ **shift**(): *[ValueOf](../README.md#valueof)‹Field› | undefined*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1249

Removes the first element from an array and returns it.

**Returns:** *[ValueOf](../README.md#valueof)‹Field› | undefined*

___

###  slice

▸ **slice**(`start?`: undefined | number, `end?`: undefined | number): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1255

Returns a section of an array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`start?` | undefined &#124; number | The beginning of the specified portion of the array. |
`end?` | undefined &#124; number | The end of the specified portion of the array.  |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

___

###  some

▸ **some**(`callbackfn`: function, `thisArg?`: any): *boolean*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1302

Determines whether the specified callback function returns true for any element of an array.

**Parameters:**

▪ **callbackfn**: *function*

A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.

▸ (`value`: [ValueOf](../README.md#valueof)‹Field›, `index`: number, `array`: [ValueOf](../README.md#valueof)‹Field›[]): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [ValueOf](../README.md#valueof)‹Field› |
`index` | number |
`array` | [ValueOf](../README.md#valueof)‹Field›[] |

▪`Optional`  **thisArg**: *any*

An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.

**Returns:** *boolean*

___

###  sort

▸ **sort**(`compareFn?`: undefined | function): *this*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1260

Sorts an array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`compareFn?` | undefined &#124; function | The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.  |

**Returns:** *this*

___

###  splice

▸ **splice**(`start`: number, `deleteCount?`: undefined | number): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1266

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`start` | number | The zero-based location in the array from which to start removing elements. |
`deleteCount?` | undefined &#124; number | The number of elements to remove.  |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

▸ **splice**(`start`: number, `deleteCount`: number, ...`items`: [ValueOf](../README.md#valueof)‹Field›[]): *[ValueOf](../README.md#valueof)‹Field›[]*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1273

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`start` | number | The zero-based location in the array from which to start removing elements. |
`deleteCount` | number | The number of elements to remove. |
`...items` | [ValueOf](../README.md#valueof)‹Field›[] | Elements to insert into the array in place of the deleted elements.  |

**Returns:** *[ValueOf](../README.md#valueof)‹Field›[]*

___

###  toLocaleString

▸ **toLocaleString**(): *string*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1217

Returns a string representation of an array. The elements are converted to string using their toLocalString methods.

**Returns:** *string*

___

###  toString

▸ **toString**(): *string*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1213

Returns a string representation of an array.

**Returns:** *string*

___

###  unshift

▸ **unshift**(...`items`: [ValueOf](../README.md#valueof)‹Field›[]): *number*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:1278

Inserts new elements at the start of an array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...items` | [ValueOf](../README.md#valueof)‹Field›[] | Elements to insert at the start of the Array.  |

**Returns:** *number*

___

###  values

▸ **values**(): *IterableIterator‹[ValueOf](../README.md#valueof)‹Field››*

*Inherited from void*

Defined in /Users/yanghanxing/code/formstate-x/node_modules/typedoc/node_modules/typescript/lib/lib.es2015.iterable.d.ts:67

Returns an iterable of values in the array

**Returns:** *IterableIterator‹[ValueOf](../README.md#valueof)‹Field››*
