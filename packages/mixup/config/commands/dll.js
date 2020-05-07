const {
  log,
  isInstallOf,
  forEachObj,
  isFunctionAndCall,
} = require('../dll/helper');

module.exports = args => mixup => {
  const webpack = require('webpack');

  let dll = mixup.dll;

  dll.callCommand();

  // entry parameter can not be empty
  if (!dll.validateEntry()) {
    throw Error('"entry" parameter no found, more config url:');
  }

  const FileNameCachePlugin = require('../dll/fileNameCachePlugin');

  mixup.chainWebpack(config => {
    config
      .plugin('dll')
      .use(webpack.DllPlugin, dll.resolveDllArgs())
      .end()
      .plugin('file-list-plugin')
      .use(FileNameCachePlugin);

    config.optimization.delete('splitChunks');
    config.optimization.delete('runtimeChunk');
    config.devtool(false);

    // set output
    forEachObj(dll.resolveOutput(), (fnName, value) => {
      isFunctionAndCall(config.output[fnName], config.output, value);
    });
  });

  let webpackConfig = mixup.resolveWebpackConfig();
  let DefinePlugin = require('webpack/lib/DefinePlugin');
  let FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
  let NamedChunksPlugin = require('webpack/lib/NamedChunksPlugin');
  let MiniCssExtreactPlugin = require('mini-css-extract-plugin');
  let fs = require('fs-extra');

  // filter plugins
  webpackConfig.plugins = webpackConfig.plugins.filter(i =>
    isInstallOf(
      i,
      DefinePlugin,
      FriendlyErrorsWebpackPlugin,
      NamedChunksPlugin,
      MiniCssExtreactPlugin,
      webpack.DllPlugin,
      FileNameCachePlugin
    )
  );

  // reset entry
  webpackConfig.entry = dll.resolveEntry();

  // remove dir
  fs.remove(dll.outputPath);

  log('Starting build dll...');
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        return reject(err);
      } else if (stats.hasErrors()) {
        return reject(new Error('Build failed with errors.'));
      }

      log('Build complete.');
      resolve();
    });
  });
};
