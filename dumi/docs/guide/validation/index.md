---
title: Validation
order: 3
toc: menu
---

In this part, we will see how to do validation with formstate-x.

### Simple Validation

First we will check a simple example: a name input with value of 5 characters at most. If user types in a name which exceeded that limit, we show a error tip.

<code src="./validation.tsx"></code>

In the example above we defined function `validateName` (we call it a "validator"), and append it to the state by calling method `validators`:

```ts
const state = new FieldState('').validators(validateName)
```

All we need to do next is consuming the validation result by access `state.hasError` or `state.error`. The validation will be applied automatically. Everytime user inputs, the value changes, and the validator will be called to check if the input correct.

### Validator

Validator is another essential concept in formstate-x. A validator is a function, who takes the input value as argument and returns error info.

The returned value (error info) can be a `string` value, which means the input value is invalid and the invalid message (such as `''Too long''` in the example above) is returned. Error info can also be a falsy value (such as `null` / `undefined` / `false` / `''`), which means the input value is valid and no message need to be returned.

If the validation process is async, a validator (which we call "async validator") can return a `Promise`. You can check details in [Async Validator](#async-validator)

Defining validate logic as such standalone functions will help us get benefits: it's easy to reuse and easy to test.

### Async Validator

<code src="./async-validation.tsx"></code>

### Reactive Validation

Benefited from MobX, the validaiton process is totally reactive. If you access some observable state in the validator, its change will cause re-validaiton, too, which is just like magic. Let's check this demo:

<code src="./reactive-validation.tsx"></code>

In the above demo, the length limit is decided by observable value `someObservableStore.lengthLimit`. When we change it by click the "Toggle strict-check" button, the field state revalidates automatically. In a real application, you can access any observable state as you want in the validator, and the validation result will always be just right.

### Conditional Validation

Based on reactivity, it's deadly easy to implement conditional validation with formstate-x. Let's check the demo:

<code src="./conditional-validation.tsx"></code>

You may find it almost the same as the demo for [Reactive Validation](#reactive-validation). Actually conditional validation is just a special case of reactive validation.

### Multiple Validators

We can append more than one validators to a state. They will be applied one by one (and lazily if possible). If any validator checking fails, the state is marked invalid (`hasError: true`).

Here's example:

<code src="./multiple-validator.tsx"></code>

You may notice that the begining value is empty (`""`), while there's no error message. After user typed in something and then cleared them, error message "Empty" is shown. In formstate-x, state only do auto-validation when it is **activated**, and state will not be activated until user typed in (`onChange` is called). You can check details about activated [here](#TODO). If you want to trigger validation by hand, you can call `state.validate()`, which triggers validation and also activates the state.
