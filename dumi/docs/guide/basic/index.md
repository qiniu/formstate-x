---
title: Basic
order: 2
toc: menu
---

We will begin with a simple "Hello" app.

In this app, we create a field state (variable `state`) for name input. By binding it to element `<input>`, it will sync user's input. After that we can consume the input value by access `state.value`:

<code src="./index.tsx"></code>

### `FieldState`

Field state (class `FieldState`) is an essential concept in formstate-x. A field state holds value (and related validation info) for one **UI input**. The **UI input** can be a HTML `<input>` element, or a custom component such as `DatePicker`.

### Input Binding

In the demo above, we bind the field state with the **UI Input** (HTML `<input>` element) by props `value` & `onChange`. We call this behavior **input binding**.

By default, `state.onChange` accepts the new value as argument. Thus we extract the new value (`e.target.value`) from the event before we call `state.onChange`.

### `observer`

As formstate-x is based on MobX, components who read state from formstate-x need to be wrapped with `observer` from `mobx-react` (or `mobx-react-lite`). You can check details in [MobX docs](https://mobx.js.org/react-integration.html).

### Hold State

For convenience, we defined the field state (variable `state`) outside the component body. Actually, like any other MobX observable state, it's ok to be hold anywhere you like.
