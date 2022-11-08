---
title: State
order: 2
toc: menu
---

### State

A formstate-x state is a object which holds state (value, error, etc.) for a input.

In formstate-x, there are more than one state types (such as `FieldState`, `FormState`, `TransformedState`, ...), while all of them implemented the same interface `IState`. Here is the interface definition:

_For convenience of reading, some unimportant fields are omitted._

```ts
/** interface for State */
export interface IState<V> {
  /** Value in the state. */
  value: V
  /** Set `value` on change event. */
  onChange(value: V): void
  /** Set `value` imperatively. */
  set(value: V): void
  /** If activated (with auto-validation). */
  activated: boolean
  /** Current validate status. */
  validateStatus: ValidateStatus
  /** The error info of validation. */
  error: ValidationError
  /** The state's own error info, regardless of child states. */
  ownError: ValidationError
  /** The state's validation result, regardless of child states. */
  rawError: ValidationResult
  /** Append validator(s). */
  withValidator(...validators: Array<Validator<V>>): this
  /** Fire a validation behavior imperatively. */
  validate(): Promise<ValidateResult<V>>
  /** Configure when state should be disabled. */
  disableWhen(predictFn: () => boolean): this
  /** Do dispose. */
  dispose(): void
}
```

### Composability

Like inputs, states are composable.

A state may be composed of multiple child states. Its value is the composition of these child states' values and its validation result reflects all its child states' validation results.

A state for a complex input can be composed of its child inputs' states.

A state for a list input can be composed of its item inputs' states.

A form, which includes multiple inputs, can be considered as a complex input with a submit button. We use a formstate-x state to hold state for a form. The state for a form can be composed of its inputs' states.

### Value

A state holds the current value, and provides methods to change it.

A input component is expected to get state from its props. The component read the value for rendering and set the value when user interacts.

The input component's consumer is expected to create the state and hold it. By passing it to the input component, the consumer get the ability to "control" the input component.

The consumer may also read value from the state for other purposes. Typically, when a user clicks the submit button, from its state a form reads the whole value for submitting (maybe sending an HTTP request).

### Validation

Validation is the process of validating user input values.

Validation is important for cases like:

* When user inputs, we display error tips if validation not passed, so users see that and correct the input
* Before form submitting, we check if all value is valid, so invalid requests to the server can be avoided

That's why validation should provide such features:

* It should run automatically, when users changed the value, or when some other data change influenced the value validity
* It should produce details such as a meaningful message, so users can get friendly hint

With formstate-x, we define validators and append them to states with `withValidator`. formstate-x will do validation for us. Through `validateStatus` & `error`, we can access the validate status and result.

For more examples of validation, check section [Validation](/guide/validation).

For more details about validators, check section [Validator](/concepts/validator).

### Activated

It's not user-friendly to notify a user for inputs he hasn't interact with.

Most forms start with all inputs empty—which values are obviously invalid. While it's not appropriate to show error tips at the beginning.

That's why there's a boolean field `activated` for states.

States will not be auto-validated until it becomes **activated**. And they will become (and stay) activated if one of these happens:

1. Value changed by user interactions (method `onChange()` is called).
2. State imperatively validated (method `validate()` is called).

### Own Error

`ownError` & `hasOwnError` are special fields especially for composed states. You can check details about them in issue [#71](https://github.com/qiniu/formstate-x/issues/71).

### Raw Error

The state's validation result, regardless of child states. The difference compared to `ownError` is that it contains the type of `ValidationErrorObject`. You can check details about them in issue [#82](https://github.com/qiniu/formstate-x/issues/82).

### Disable State

You may find that we defined method `disableWhen` to configure when a state should be disabled. It is useful in some specific cases. You can check details in section [Disable State](/guide/advanced#disable-state).
