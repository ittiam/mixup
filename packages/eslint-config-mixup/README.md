# eslint-config-mixup

#### ESLint sharable config for Mixup

## Install

```
$ npm install eslint babel-eslint  eslint-config-mixup --save-dev
```

## Usage

Add `.eslintrc.js` on your project's root directory.

```javascript
// .eslintrc.js
module.exports = {
  extends: ['mixup'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### Support Vue

#### Install

```
$ npm install --save-dev eslint babel-eslint vue-eslint-parser eslint-plugin-vue eslint-config-mixup
```

#### rules and syntax

```javascript
// .eslintrc.js
module.exports = {
  extends: ['mixup', 'mixup/vue'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### Support React

#### Install

```
$ npm install --save-dev eslint babel-eslint eslint-plugin-react eslint-config-mixup
```

#### rules and syntax

```javascript
module.exports = {
  extends: ['mixup', 'mixup/react'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### Support Typescript

#### Install

```
$ npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-mixup
```

#### rules and syntax

```javascript
module.exports = {
  extends: ['mixup', 'mixup/typescript'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```
