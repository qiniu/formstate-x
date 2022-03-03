---
title: Input
order: 1
toc: menu
---

### Input

A input is a part of an application, which collects info from user interaction. Typical inputs include:

* HTML `<input type="text" />` which collects a text string
* [MUI `Date Picker`](https://mui.com/components/date-picker/) which collects a date
* [Antd `Upload`](https://ant.design/components/upload/) which collects a file
* Some `FullNameInput` which collects someone's full name
* ...

### General Input API

We will introduce general inputs' API based on [React.js](https://reactjs.org/). It will not be very different in other UI frameworks like [Vue.js](https://vuejs.org/) or [Angular](https://angular.io/).

In a React.js application, a [(controlled) input component](https://reactjs.org/docs/forms.html#controlled-components) always provides an API like:

```ts
type Props<T> = {
  value: T
  onChange: (event: ChangeEvent) => void
}
```

The prop `value` means the current input value, which will be displayed to the user.

The prop `onChange` is a handler for event `change`. When user interaction produces a new value, the input fires event `change`—the handler `onChange` will be called.

Typically the consumer of the input holds the value in a state. In the function `onChange`, it sets the state with the new value, which causes re-rendering, and the new value will be displayed.

An [uncontrolled input component](https://reactjs.org/docs/uncontrolled-components.html) may behave slightly different, but the flow are mostly the same.

A complex input may consist of multiple simpler inputs. MUI `Date Picker` includes a number input and a select-like date selector, A `FullNameInput` may includes a first-name input and a last-name input, etc. While no matter how complex it is, as consumer of the input, we do not need to know its implementation or UX details. All we need to do is making a convention of the input value type and then expect the input to collect it for us. That's the power of abstraction.

### Input API in formstate-x

While in forms of real applications, value of input is not the only thing we care. Users may make mistakes, we need to validate the input value and give users feedback.

The validation logic, which decides if a value valid, is always related with the logic of value composition and value collection—the logic of the input.

The feedback UI, which tells users if they made a mistake, is always placed beside the input UI, too.

Ideally we define inputs which extracts not only value-collection logic, but also validation and feedback logic. Like that the value can be accessed by the consumer, the validation result should be accessable for the consumer.

While the API above (`{ value, onChange }`) does not provide ability to encapsulate validation and feedback logic in inputs. That's why we introduce a new one:

```ts
type Props = {
  state: State
}
```

`State` is a object including the input value and current validation info. For more details about it, check section [State](/concepts/state). By passing a state to an input component, information exchanges between the input and its consumer are built.

An important point is, the logic of (creating) state is expected to be provided by the input—that's how the input decides the validation logic. Apart from the component definition, the module of a input will also provide a state factoty, which makes the module like this:

```ts
// the input state factory
export function createState(): State {
  // create state with certain validation logic
}

// the input component who accepts the state
export default function Input({ state }: { state: State }) {
  // render input with value & validation info from `state`
}
```

The consumer of the input may access and imperatively control (if needed) value and 
validation info through `state`.

### Composability

Inputs are still composable. We can build a complex input based on simpler inputs. A `InputFooBar` which consists of `InputFoo` and `InputBar` may look like this:

_Below content is a pseudo-code sample. For more realistic example, you can check section [Composition](/guide/composition)._

```tsx | pure
import InputFoo, * as inputFoo from './InputFoo'
import InputBar, * as inputBar from './InputBar'

type State = Compose<inputFoo.State, inputBar.State>

export function createState(): State {
  return compose(
    inputFoo.createState(),
    inputBar.createState()
  )
}

export default function InputFooBar({ state }: { state: State }) {
  return (
    <>
      <InputFoo state={state.foo} />
      <InputBar state={state.bar} />
    </>
  )
}
```
