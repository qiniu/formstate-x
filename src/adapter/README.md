# formstate adapter

This module provides a [formstate](https://github.com/formstate/formstate) adapter, with which you can use formstate state in formstate-x `FormState` like this:

```ts
import * as fs from 'formstate'
import { FormState } from 'formstate-x'

// the adapt method
import { xify } from 'formstate-x/esm/adapter'

// formstate FieldState or FormState
const stateA = new fs.FieldState(1)
const stateB = new fs.FormState({ ... })

// formstate-x FormState
const formState = new FormState({
  a: xify(state),
  b: xify(stateB)
})

// you can use the form state as usual
console.log(formState.value)
const result = await formState.validate()
```

It is helpful when migrating your project from formstate to formstate-x. Instead of rewriting all your input / field components at once, you can do it one by one. The adapter makes it possible to use formstate-based input / field component in a formstate-x-based form / page component.

**NOTE: [`FormStateLazy`](https://formstate.github.io/#/?id=formstatelazy) is not supported yet.**
