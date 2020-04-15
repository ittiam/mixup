const merge = require('deepmerge');
const babelMerge = require('babel-merge');

const applyUse = from => to => {
  from.uses.values().forEach(use => {
    to.use(use.name).merge(use.entries());
  });
};

// vue-loader needs CSS files to be parsed with vue-style-loader instead of
// style-loader, so we replace the loader with the one vue wants.
// This is only required when using style-loader and not when extracting CSS.
const replaceStyleLoader = rule => {
  if (rule.uses.has('style-loader')) {
    rule.use('style-loader').loader(require.resolve('vue-style-loader'));
  }
};

const applyLoader = styleRule => {
  const styleTest = styleRule.oneOf('normal').get('test');
  const styleModulesEnabled = styleRule.oneOfs.has('normal-modules');

  if (styleRule) {
    styleRule
      .when(styleModulesEnabled, rule => {
        rule
          .oneOf('vue-modules')
          .before('normal-modules')
          .test(styleTest)
          .resourceQuery(/module/)
          .batch(applyUse(styleRule.oneOf('normal-modules')))
          .batch(replaceStyleLoader);
      })
      .when(styleRule.oneOf('normal'), rule => {
        rule
          .oneOf('vue-normal')
          .before(styleModulesEnabled ? 'normal-modules' : 'normal')
          .test(styleTest)
          .resourceQuery(/\?vue/)
          .batch(applyUse(styleRule.oneOf('normal')))
          .batch(replaceStyleLoader);
      });
  }
};

module.exports = (opts = {}) => mixup => {
  const options = merge(
    {
      style: {
        loaders: ['css', 'postcss', 'less', 'sass', 'scss', 'stylus'],
      },
    },
    opts
  );

  const rootOptions = mixup.options;

  // Add vue extension as a higher priority than JS files.
  // Since mixup.options.extensions is always a copy of a Set,
  // this splice operation is always mutation-safe.
  mixup.config.resolve.extensions.prepend('.vue');

  // Vue component oneOfs are prepended to our style rule so they match first.
  // The test from the "normal" oneOf is also applied.
  options.style.loaders.forEach(ruleId => {
    const styleRule = mixup.config.module.rules.get(ruleId);
    applyLoader(styleRule);
  });

  mixup.config.resolve.alias.set(
    'vue$',
    rootOptions.runtimeCompiler
      ? 'vue/dist/vue.esm.js'
      : 'vue/dist/vue.runtime.esm.js'
  );

  mixup.config.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

  mixup.config.module
    .rule('vue')
    .test(mixup.regexFromExtensions(['vue']))
    .use('vue-loader')
    .loader(require.resolve('vue-loader'));

  mixup.config
    .plugin('vue-loader')
    .use(require.resolve('vue-loader/lib/plugin'));

  if (mixup.config.module.rules.has('babel')) {
    // We need to remove vue files from being parsed by Babel since the
    // vue-loader/VueLoaderPlugin will break down a vue file into its component
    // part files. For example, the <script> in a vue file becomes a JS file,
    // which will then be parsed by Babel, so no need for a double parse.
    mixup.config.module
      .rule('babel')
      .test(
        mixup.regexFromExtensions(
          mixup.options.extensions.filter(ext => ext !== 'vue')
        )
      );

    mixup.config.module
      .rule('babel')
      .use('babel-loader')
      .tap(babelOptions =>
        babelMerge(babelOptions, {
          presets: [
            [
              '@vue/babel-preset-jsx',
              typeof options.jsx === 'object' ? options.jsx : {},
            ],
          ],
        })
      );
  }

  const lintRule = mixup.config.module.rules.get('lint');
  if (lintRule) {
    // We need to re-set the extension list used by the eslint settings
    // since when it was generated it didn't include the vue extension.
    lintRule.test(mixup.regexFromExtensions());

    lintRule.use('eslint').tap(
      // Don't adjust the lint configuration for projects using their own .eslintrc.
      lintOptions =>
        lintOptions.useEslintrc
          ? lintOptions
          : merge(lintOptions, {
              baseConfig: {
                extends: ['plugin:vue/base'],
                parser: 'vue-eslint-parser',
                parserOptions: {
                  parser: 'babel-eslint',
                },
                plugins: ['vue'],
              },
            })
    );
  }
};
