module.exports = pluginOptions => mixup => {
  let webpackConfig = mixup.config;

  ['normal', 'normal-modules', 'vue', 'vue-modules'].forEach(oneOf => {
    webpackConfig.module
      .rule(pluginOptions.preProcessor)
      .oneOf(oneOf)
      .use('style-resources-loader')
      .loader('style-resources-loader')
      .options({
        patterns: pluginOptions.patterns,
      });
  });
};
