module.exports = {
  plugins: ['eslint:recommended'],
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    indent: ['error', 2, { MemberExpression: 'off' }],
    'no-undef': ['error'],
    'operator-linebreak': ['error', 'before'],
  },
};
