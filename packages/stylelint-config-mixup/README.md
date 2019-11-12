# stylelint-config-mixup

## Installation

Install `stylelint-config-mixup`:

```
$ npm install --save-dev stylelint stylelint-config-mixup
```

Then, append `stylelint-config-mixup` to the [`extends` array](https://stylelint.io/user-guide/configuration/#extends) in your `.stylelintrc.*` file. Make sure to put it **last,** so it will override other configs.

```js
{
  "extends": [
    // other configs ...
    "stylelint-config-mixup"
  ]
}
```

