# mix

> 更易上手的前端构建工具，基于 webpack


## Installation
```shell
npm i @mixup/mix -D
```

## Usage

mix.conf.js

```javascript
var mix = require('@mixup/mix')

mix.set({
  entry: './src/index.js',
  dist: './dist',
  template: './index.tpl',
  hash: true,
  extractCSS: true,
  devServer: { port: 8080 }
})

module.exports = mix.resolve()
```

```shell
# development
node_modules/.bin/mix watch

# production
node_modules/.bin/mix build -p

# or use webpack
NODE_ENV=production webpack --config mix.conf.js
```
