module.exports = {
  extends: ['./es6', './rules/react', './rules/react-a11y'].map(
    require.resolve
  ),
  rules: {},
};
