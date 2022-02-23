---
title: Validation
order: 3
toc: menu
---

In this part, we will see how to do validation with formstate-x.

### Simple Validation

First we will check a simple example: a name input with value of 5 characters at most. If user types in a name which exceeded that limit, we show a error tip.

<code src="./validation.tsx"></code>

In the example above we defined function `validateName` (we call it a "validator"), and append it to the state by calling method `withValidator`:

```ts
const state = new FieldState('').withValidator(validateName)
```

All we need to do next is consuming the validation result by access `state.hasError` or `state.error`. The validation will be applied automatically. Everytime user inputs, the value changes, and the validator will be called to check if the input valid.

### Validator

Validator is another essential concept in formstate-x. A validator is a function, which takes the input value as argument and returns error info.

The returned value (error info) can be a `string` value, which means the input value is invalid and the invalid message (such as `"Too long"` in the example above) is returned. Error info can also be a falsy value (such as `null` / `undefined` / `false` / `''`), which means the input value is valid and no message need to be returned.

If the validation process is async, a validator—we call it "async validator"—can return a `Promise`. You can check details in [Async Validator](#async-validator)

Defining validate logic as multiple standalone functions has benefits: they are easy to reuse and easy to test.

### Async Validator

<code src="./async-validation.tsx"></code>

If one validator returns a `Promise`, we call it async validator. We expect the promise to resolve with an error info, just the same as the return value of normal validators. And the value will be treated the same way as the return value of normal validators: non-empty `string` value means invalid and falsy value means valid.

If the promise rejects, the rejected value will be thrown during validation. This validation will not be considered either valid or invalid. So if you do some HTTP API calling in an async validator, it is recommended to deal with the potential exception. For example:

```ts
async function validateName(v: string) {
  try {
    // Assume the API (`/validate?name`) validates name
    // and returns sth like `{ valid: false, message: '...' }`
    const resp = await fetch(`/validate?name=${encodeURIComponent(v)}`)
    const data = await resp.json()
    return data.valid ? undefined : data.message
} catch (e) {
    // If some exception (such as network error) occurs, this `catch` prevents formstate-x to throw.
    // The return value, instead, tells formstate-x to treat the value as invalid (with message "Validate failed")
    return 'Validate failed'
  }
}
```

Tips: If your validator includes one or more HTTP API callings and the value may change frequently, you may want to add debouncing to avoid frequent HTTP request. Consider using [`DebouncedState`](/guide/advanced#debounced-state).

### Reactive Validation

Benefited from MobX, the validaiton process is totally reactive. If you access some other observable state in the validator, the state's change will cause re-validaiton, too. You don't need to tell formstate-x which states' change will influence the validation result, formstate-x already know it, just like magic. Let's check this demo:

<code src="./reactive-validation.tsx"></code>

In the above demo, the length limit is decided by observable value `someObservableStore.lengthLimit`. When we change it by click the "Toggle strict-check" button, the field state revalidates automatically. In a real application, you can access any observable state as you want in the validator, and the validation result will always be just right.

### Conditional Validation

Based on reactivity, it's deadly easy to implement conditional validation with formstate-x. Let's check the demo:

<code src="./conditional-validation.tsx"></code>

You may find it almost the same as the demo for [Reactive Validation](#reactive-validation). Actually conditional validation is just a special case of reactive validation.

For complex states, it may not be convenient to check `enable` in each validator. You can use `disableWhen` for such cases. See details in [Disable State](/guide/advanced#disable-state).

### Multiple Validators

We can append more than one validators to a state. All validators' checking should pass before the state is marked as valid. If any validator's checking fails, the state is marked as invalid.

Here's example:

<code src="./multiple-validator.tsx"></code>

In this example, we use two validators to ensure the name input

1. not empty
2. not too long

Only values which satisfy both requirements will be considered valid. You can also mix async validators with normal validators, nothing special.

You may notice that the begining value is empty (`""`), while there's no error message. After user typed in something and then cleared them, error message "Empty" is shown. In formstate-x, state only do auto-validation when it is **activated**, and state will not be activated until user operates (`onChange` is called). You can check details about **activated** [here](#TODO). If you want to trigger validation by hand, you can call `state.validate()`, which imperatively triggers validation and also activates the state.
