---
title: Basic
order: 2
toc: menu
---

We will begin with a simple "Hello" app.

In this app, we create a field state (variable `state`) for name input. By binding it to element `<input>`, it will sync user's input. After that we can consume the input value by access `state.value`:

<code src="./index.tsx"></code>

### `FieldState`

Field state (class `FieldState`) is an essential concept in formstate-x. A field state holds value (and related validation info) for one **UI input**. The **UI input** can be a `<input>` element, or a custom component such as `DatePicker`.

### Input Binding

In the demo above, we use `bindInput` to generate props to bind field state with an HTML `input`. It returns a `{ value, onChange }` object, `value` represents the instant value of field state and `onChange` changes the value of field state. By default, `onChange` accepts the new value as argument, here we passed an arrow function `e => e.target.value`, so that `onChange` is able to accept event object and extracts value from it.

### `observer`

As formstate-x is based on MobX, components who read state from formstate-x need to be wrapped with `observer` from `mobx-react` (or `mobx-react-lite`). You can check details in [MobX docs](https://mobx.js.org/react-integration.html).

### State Location

For convenience, we defined the field state (variable `state`) outside the component body. Actually, like all other MobX observable states, it's ok to be put anywhere you like.

### Debounce

You may find that in the demo above, there is a delay between keyboard typing and the hello word changing, which is intended. With a debounce (default to 200ms), we get performance benefit when the app size grows.
