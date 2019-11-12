module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-rational-order',
    'stylelint-config-prettier'
  ],
  plugins: ['stylelint-order', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'comment-empty-line-before': null,
    'function-name-case': ['lower', { ignoreFunctions: ['/colorPalette/'] }],
    'no-invalid-double-slash-comments': null,
    'no-descending-specificity': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      }
    ]
  }
};
