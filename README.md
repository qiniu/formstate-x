# formstate-x

[![](https://github.com/qiniu/formstate-x/workflows/CI/badge.svg)](https://github.com/qiniu/formstate-x/actions?query=workflow%3ACI+branch%3Amaster)
[![Coverage Status](https://coveralls.io/repos/github/qiniu/formstate-x/badge.svg?branch=master)](https://coveralls.io/github/qiniu/formstate-x?branch=master)
[![](https://github.com/qiniu/formstate-x/workflows/Doc/badge.svg)](https://github.com/qiniu/formstate-x/actions?query=workflow%3ADoc+branch%3Amaster)
[![](https://github.com/qiniu/formstate-x/workflows/Publish/badge.svg)](https://github.com/qiniu/formstate-x/actions?query=workflow%3APublish+branch%3Amaster)

formstate-x is a tool to help you manage form state, based on [MobX](https://mobx.js.org/). formstate-x provides:

* **Composability**: Forms are composition of inputs, complex inputs are composition of simpler inputs. With composability provided by formstate-x, you can build arbitrary complex forms or input components with maximal code reuse.
* **Type safety**: With Typescript, no matter how complex or dynamic the form logic is, you can get type-safe result for value, error, validator, etc.
* **Reactive validation**: With reactivity system of MobX, every dependency change triggers validation automatically and you can easily react to state change
* **UI-independent**: formstate-x only deals with state / data, you can easily use it with any UI library you like

### Documentation

You can find full documentation [here](https://qiniu.github.io/formstate-x/).

### Contributing

1. Fork the repo and clone the forked repo
2. Install dependencies

    ```shell
    npm i
    ```

3. Edit the code
4. Do lint & unit test

    ```shell
    npm run validate
    ```

5. Commit and push, then create a pull request
