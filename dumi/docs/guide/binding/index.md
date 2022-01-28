---
title: Binding
order: 4
toc: menu
---

In this part, We will introduce how to use formstate-x with a 3rd-party UI library.

### Material-UI

First we will introduce a demo showing how to use formstate-x with [Material-UI](https://mui.com/).

<code src="./material-ui.tsx"></code>

In the demo we use formstate-x to hold & validate input from component `Switch` & component `TextField`. We defined two functions to archieve this:

* `bindSwitch` bind field state to Materail-UI `Switch`
* `bindTextField` bind field state to Materail-UI `TextField`

It's quite easy. If you are using other input components like `Radio`, `Select`, etc, you can define similar functions to bind formstate-x state to them.

And that's almost all.

Most of the following examples within our guide will be built with Material-UI.

### Ant Design

[Ant Design](https://ant.design/) is another popular UI library for React. The next demo is for formstate-x with Ant Design.

<code src="./antd.tsx"></code>

The two key functions in the above demo are:

* `bindInput`: bind field state to antd `Input` & `Input.Password` (for value change)
* `bindFormItem`: bind field state to antd `Form.Item` (for validation result)
