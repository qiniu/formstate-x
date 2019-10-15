[formstate-x](../README.md) › [Disposable](disposable.md)

# Class: Disposable

Class that collects side-effects and dispose them on demand.

## Hierarchy

* **Disposable**

  ↳ [FormState](formstate.md)

  ↳ [FieldState](fieldstate.md)

## Index

### Constructors

* [constructor](disposable.md#constructor)

### Methods

* [dispose](disposable.md#dispose)

## Constructors

###  constructor

\+ **new Disposable**(): *[Disposable](disposable.md)*

*Defined in [disposable.ts:28](https://github.com/qiniu/formstate-x/blob/4d17690/src/disposable.ts#L28)*

**Returns:** *[Disposable](disposable.md)*

## Methods

###  dispose

▸ **dispose**(): *void*

*Defined in [disposable.ts:23](https://github.com/qiniu/formstate-x/blob/4d17690/src/disposable.ts#L23)*

Do dispose by calling all disposer functions.

**Returns:** *void*
