# eslint-config-mixup

#### ESLint sharable config for Mixup

## Install
```
$ npm install eslint eslint-config-mixup --save-dev
```

## Usage
Add `.eslintrc.js` on your project's root directory.
```javascript
// .eslintrc.js
module.exports = {
  'extends': 'mixup',
  'rules': {
    // Override rules or Add more rules
  }
};
```
### Support ES6
#### rules and syntax
To Support ES6 rules, use `mixup/es6` instead.
```javascript
// .eslintrc.js
module.exports = {
  'extends': 'mixup/es6' // default rule and ES6 rule
};
```
#### syntax only
By default, ESLint configuration expects ES5 syntax. You can override this setting to enable support for ES6 syntax and new ES6 global variables.
```javascript
// .eslintrc.js
module.exports = {
  'extends': 'mixup', // no ES6 rule
  'env': {
    'es6': true
  }
};
```

