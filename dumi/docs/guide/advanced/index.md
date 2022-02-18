---
title: Advanced
order: 6
toc: menu
---

### Debounced State

For UI inputs like `<input type="text" />`, if the user operates (pressing key, etc.) quite quickly, the inputs' values may change frequently. Sometimes the value change may cause expensive reactions, such as:

* HTTP request for a search input
* Rerender of a huge form (certain input value may affect other inputs' behavior)
* Some complex validating logic

That's when we want to add debouncing for the value change. We can use `DebouncedFieldState` to do so:

<code src="./debounced-field-state.tsx"></code>

You may notice that there is a small difference between this demo and the basic one (with `FieldState`): when using `DebouncedFieldState`, we need use `state.$` instead of `state` itself for UI binding. So that the input keeps responsive, while other parts of the application react with a delay.

By default, `DebouncedFieldState` debounces value change with a delay of `200ms`. You can specify that by passing a time length:

```ts
new DebouncedFieldState(initialValue, 1000) // which indicates a delay of `1s`
```

Apart from class `DebouncedFieldState`, formstate-x also provides class `DebouncedState`.

```ts
new DebouncedFieldState(initalValue, delay)
```

is a shortcut for

```ts
new DebouncedState(new FieldState(initalValue), delay)
```

In most cases, you do not need to add debouncing for form state (`FormState` or `ArrayFormState`); if you need, just use `DebouncedState` directly:

```ts
const formState = new FormState({
  foo: new FieldState('')
})
const debouncedFormState = new DebouncedState(formState, delay)
```

### Cross-State Validation

formstate-x provides super powerful cross-state validation ability. As a classic case, we will show how to build a signup form. In this form, validation behavior for "confirm password" depends on value of "password": value of the two should be the same.

<code src="./password-validation.tsx"></code>

You will find it super simple, the magic happens here:

```ts
const rePasswordState = new FieldState('').addValidator(
  v => v !== passwordState.value && 'Not the same!'
)
```

As we learnt from section [Reactive Validation](/guide/validation#reactive-validation), if you access observable data inside validator, the validator will be triggered automatically when the observable data changes. In this case, which means, you don't even need to know that "rePassword" should be revalidated when "password" changes, also you don't need to tell formstate-x so, it just works, as long as you read its value correctly.

### Transformed State

When we create input components based on UI inputs, these input components always provide their own business semantics which differs from the semantics of the original UI inputs. Which means, sometimes there's a gap between the business-value and the view-value for one component.

Let's take a component named `NumberInput` as example.

```ts
function NumberInput({ state }) {}
```

A typical number input is made with a normal text input to collect user input. So we will use a `FieldState<string>` to hold its view-value (and related validation info):

```ts
const state = new FieldState('')
```

However, as implementation details, the `string`-type value, is not the value we would like the consumer of `NumberInput` to access. The component should behave as its name (`NumberInput`) suggests, collecting `number`-type value from user.

We need to transform the `string`-type value to number before we export it out. That's when `TransformedState` rescues:

<code src="./number-input"></code>

In component `NumberInput`, we created a transformed state `numState` as the return value of function `createState`. It wraps the original state `textState` and deals with the value transforming.

We can access the original state with `numState.$` - as you can see in `NumberInput` we bind it to `TextField`. The transformed state `numState` is for the consumer of `NumberInput` (in this case, the form), which makes the form unaware of the inside `string`-type value.

We can transform any state which implements interface [`IState`](#TODO). Here is another example in which we do transforming in `FullNameInput`:

<code src="./full-name-input"></code>

It's almost the same as the demo we see in section [Composition](/guide/composition#complex-input). In component `FullNameInput` we use a transformed state to join first name and last name before it is returned. So the form will get a joined full name instead of a `{ first, last }` object.

As a conclusion, `TransformedState` helps to hide implementation details, which is significantly important when building a extremely complex form with composition.

### Disable State

In section [Conditional Validation](/guide/validation#conditional-validation), we showed how to control validator behavior based on some observable state. In most simple conditional-validation cases, that's enough.

However, sometimes we may add more than one validators for one state. It will not be convenient to add the `if` logic in each validator.

Sometimes we face complex states, which composed with many child states. It's not possible to change child states' validators' logic for the parent state. `formstate-x` provides a method `disableWhen` to help with such cases.

Here is a demo:

<code src="./disabled-state"></code>

With `state.disableWhen(predictFn)` you can tell the state to keep disabled any time when `predictFn` returns true. If one state is `disabled`, it means:

- the corresponding UI is invisible or disabled
- state value do not need to (and will not) be validated
- state `onChange` will not be called
- no error info will be provided
