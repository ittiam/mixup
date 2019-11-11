# babel-preset-mixup

This package includes the [Babel](https://babeljs.io) preset used by [Razzle](https://github/com/palmerhq/razzle)

## Usage in Mixup Projects

The easiest way to use this configuration is with Mixup, which includes it by default. **You don’t need to install it separately in Mixup projects.**

## Usage Outside of Mixup

If you want to use this Babel preset in a project not built with mixup, you can install it with following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then create a file named `.babelrc` with following contents in the root folder of your project:

  ```js
  {
    "presets": ["mixup"]
  }
  ```

This preset uses the `useBuiltIns` option with [transform-object-rest-spread](http://babeljs.io/docs/plugins/transform-object-rest-spread/), which assumes that `Object.assign` is available or polyfilled.