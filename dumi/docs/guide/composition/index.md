---
title: Composition
order: 5
toc: menu
---

In real applications, a form usually consists of plenty of inputs. A complex input component (such as date-picker, searchable-select, etc) usually consists of more than one basic input components. Composition, is the key problem need to be solved by form tools.

With composability provided by formstate-x, you can build arbitrary complex forms or input components with maximal code reuse.

### Simple Form

We will start with a simple signin-form demo:

<code src="./signin-form.tsx"></code>

Based on things we learnt from [UI library binding](/guide/binding) section, we use [Material-UI](https://mui.com/) to help build this demo. It should be mostly the same if you use other UI libraries to do so.

Notice that we compose a form state (variable `form`) with three field states (`username`, `password` & `remember`). It's archieved by using class `FormState`, which takes multiple field states together to one form state. You can manage states of all the inputs as a whore with the form state, such as:

```ts
form.value // { username: '', password: '', remember: false }
form.hasError // if there is validation error in the form
form.validate() // trigger validation (including all child states)
```

And it's all type-safe (including `value`, `onChange`).

After binding the states to corresponding input components, all you need to do is handling event `submit`. Typically, in function `handleSubmit` we trigger validation of the whore form, and check the result:

```ts
const result = await form.validate()
if (result.hasError) return
```

This will ensure that every input's value valid, whether it is activated or not. If the check (for `result.hasError`) passes, the form data (`result.value`) is guaranteed to be valid. You can now do anything you need with the form data, such as sending an HTTP request.

That's almost all you need to know to build a simple form with formstate-x. Next, we will show how to build complex input with formstate-x.

### Complex Input

Tools like React makes it easy to realize complex applications by building small components and compose them together. In real applications, not only the form is composed of inputs, complex inputs are always composed of simpler inputs.

With demo of a "Full Name input", we will see how to build complex inputs with formstate-x.

<code src="./full-name-input/index.tsx"></code>

In this demo we created a custom component called `FullNameInput` in file `FullNameInput.ts`. It is used to collect the user's full name (including first name and last name). As we can see, state of `FullNameInput` consists of two child states:

```ts
new FormState({
  first: new FieldState('').withValidator(required),
  last: new FieldState('').withValidator(required)
})
```

With `FormState`, the two child states (`first` & `last`) are composed together and behaves as one state. If we check the API of `FullNameInput`, unlike basic input components with props `value` & `onChange`, `FullNameInput` requries prop `state`:

```ts
interface Props {
  state: ReturnType<typeof createState>
}
```

In addition of component `FullNameInput`, the module exported function `createState` as well, which is used to create the state for component `FullNameInput`.

It is easy to embed the `FullNameInput` in a form, we can find it in file `index.ts`, which consists of two parts:

##### 1. Create state for `FullNameInput`, as part of state for form when creating state

```ts
const form = new FormState({
  name: createFullNameState(),
  email: new FieldState('').withValidator(validateEmail)
})
```

##### 2. Pass the state to component `FullNameInput` when rendering form

```tsx | pure
<FullNameInput state={form.$.name} />
```

The best part is that no matter how complex component `FullNameInput` (or its state) is, its API follows the pattern: function `createState` & component `Input`. The parent component does not need to know details about `FullNameInput`, and `FullNameInput` does not need to know anything about its parent comoponent (or the form), which makes composition easy and the whole structure fractal.

### Input List

Sometimes we need to collect list of input from user and the size of list is uncertain—user can add or remove input item dynamically. Here we will show how to deal with such cases with formstate-x.

<code src="./input-list.tsx"></code>

The above demo shows how to make a form in which user can submit more than one phone number with `ArrayFormState`. We can validate each phone number on the field state, also validate the number list on the array form state. Note that the array form state can also be child state of another form state—it's totally composable.
