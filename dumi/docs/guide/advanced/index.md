---
title: Advanced
order: 6
toc: menu
---

### Cross-State Validation

formstate-x provides super powerful cross-state validation ability. As a classic case, we will show how to build a signup form. In this form, validation behavior for "confirm password" depends on value of "password": value of the two should be the same.

<code src="./password-validation.tsx"></code>

You will find it super simple, the magic happens here:

```ts
const rePasswordState = new FieldState('').validators(
  v => v !== passwordState.value && 'Not the same!'
)
```

As we know from section [Reactive Validation](#TODO), if you access observable data inside validator, the validator will be triggered automatically when the observable data changes. In this case, which means, you don't even need to know that "rePassword" should be revalidated when "password" changes, also you don't need to tell formstate-x so, it just works, as long as you read its value correctly.

### Proxy State

When we create input components with basic inputs, these input components get their own business semantics which differs from the semantics of the original inputs. Which means, sometimes there's a gap between the business-value and the view-value for one component.

Let's take a component named `NumberInput` as example.

```ts
function NumberInput({ state }) {}
```

A typical number input is made with a normal text input to collect user input. Which means, we will use a `FieldState<string>` to hold its value (and other validation-related info):

```ts
const state = new FieldState('')
```

However, as implementation details, the `string`-type value, is not the value we would like the consumer component to access. The component should behave as its name (`NumberInput`) suggests, collecting `number`-type value from user for its consumer component, where `ProxyState` rescues:

<code src="./number-input"></code>

In component `NumberInput`, we created a proxy state `numState` as the return value of function `createState`. It wraps the original state `textState` (which we call **proxied state**) and deals with the value convertion.

We can access the proxied state with `numState.$` - as you can see in function `NumberInput`, we bind it to `TextField`. The proxy state `numState` is for the consumer component (is this case the form), which makes the form unaware of the inside `string`-type value.

We can proxy any state which implements interface [`IState`](#TODO). Here is another example in which we do proxy in `FullNameInput`:

<code src="./full-name-input"></code>

It's almost the same as the demo we see in section [Composition](#TODO). In component `FullNameInput` we use a proxy state to join first name and last name before it is returned. So the form will get a joined full name instead of a `{ first, last }` object.

`ProxyState` helps hide implementation details, which is significantly useful when building a extremely complex form with composition.
