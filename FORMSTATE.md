# formstate-x 相比 formstate 的调整

### 1. `$` & `value`

调整 `$` & `value` 的定位，`FieldState` 新增字段 `_value`

#### FieldState

* `_value`: 原始值，即时响应 `onChange` 的值，用于绑定界面输入组件，同原 formstate `value`
* `value`: 值（程序可消费），`_value` debounce（默认 200ms）后同步到 `value`
* `$`: 校验通过的安全值，同原 formstate `$`

#### FormState

* `value`: 值，为所有子字段的 `value` 的组合值（Plain JavaScript Value）
* `$`: 子字段集合，同原 formstate `$`

### 2. `validators()` 行为

原 formstate 中 `state.validators()` 会覆盖 `state` 的 validator 列表，现在行为变成追加，即：

```ts
state.validators(validator1)
state.validators(validator2, validator3)

state // 现在 state 会有 validator1, validator2, validator3 三个校验函数
```

### 3. 校验逻辑

* 校验参数

    现在 `FormState` 传递给 validator 的参数是 `FormState` 实例的 `value` 字段的值（原先是 `$` 字段的值）。

* 响应 validator(s) 被调用时所有的依赖

    现在执行 validator(s) 时所有的依赖变更都会触发重新校验（formstate 只会在 `state.onChange()` 时触发）；

    甚至包括 validators 列表本身的变化，即，通过调用 `state.validators()` 向 `state` 添加 validator 也会触发重新校验。

### 4. 调整 `reset()` 逻辑

`reset()` 不再支持传参，调用之会将该 state 的值重置为 initial value（构造 state 时传入的值）；`FormState` 的 `reset()` 方法会触发其所有子 state 的 `reset()`

### 5. `set()` 方法

`FieldState` 新增 `set()` 方法，可以同步地更新 `value` & `$`，且不会“激活”该 field，即，初始状态下没有被校验的 field，在被 `set()` 后也不会触发校验。

### 6. 支持禁用校验

添加 `disableValidationWhen()` 方法，传入函数 `() => someExpression`，则当 `someExpression` 为 `true` 时，`state` 所有的校验行为都会被禁用，校验结果也对应地被清除；`someExpression` 为 `false` 时校验行为及结果相应恢复。

注意你可以在 `someExpression` 里使用 observable 数据，数据本身的变更会被观测到。

如：

```ts
const options = observable({ disabled: false })
state.disableValidationWhen(() => options.disabled)
// 此时 state 的校验逻辑正常
runInAction(() => options.disabled = true)
// 此时 state 的校验逻辑自动被禁用
runInAction(() => options.disabled = false)
// 此时 state 的校验逻辑恢复正常
```

* 注意如下情形：

    假设有这样一组父子表单的嵌套关系 `AFormState` -> `BFormState` -> `CFormState` / `DFieldState`

    并且满足 `BFormState.disableValidationWhen(() => true)`

    那么 `BFormState` 的子表单 `CFormState` / `DFieldState` 的校验状态依然是不受 `BFormState` 影响的

    它只能让 `BFormState` 及其祖先 `AFormState` 觉得 `BFormState` 的校验是通过的

    行为类似于在 `BFormState` 这一层做了类似 `validateEvent.preventDefault()` + `validateEvent.stopPropagation()` 的事情


### 7. dispose

formstate-x 提供的 `FieldState` & `FormState` 实例在不再需要的时候都需要被手动 dispose（通过 `state.dispose()`）。
