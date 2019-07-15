'use strict';

const path = require('path');
const webpack = require('webpack');

const mergeDev = require('./merge-dev');
const mergeProd = require('./merge-prod');
const is = require('./is');
const loadTemplate = require('./load-template');

/**
 * merge
 * @param  {object} userConfig
 * @param  {object} baseConfig
 * @return {object} webpack config
 */
module.exports = function(userConfig, baseConfig) {
  let config = baseConfig;

  // entry
  config.entry = userConfig.entry;

  // dist
  config.output.path = path.resolve(process.cwd(), userConfig.dist || baseConfig.output.path);

  // publicPath
  config.output.publicPath = is.nil(userConfig.publicPath)
    ? config.output.publicPath
    : userConfig.publicPath;

  // template
  if (userConfig.template !== false) {
    Object.assign(config.plugins, loadTemplate(userConfig.template || config.template));
  }

  // format
  if (userConfig.format === 'cjs') {
    config.output.libraryTarget = 'commonjs2';
  } else if (userConfig.format) {
    config.output.libraryTarget = userConfig.format;
  }

  // moduleName
  if (userConfig.moduleName) {
    config.output.library = userConfig.moduleName;
  }

  if (userConfig.format === 'umd' || userConfig.format === 'amd') {
    config.output.umdNamedDefine = true;
  }

  // node_env
  if (is.Object(userConfig.env)) {
    config.plugins.Define = new webpack.DefinePlugin(
      Object.assign(
        {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        },
        userConfig.env
      )
    );
  } else {
    config.plugins.Define = new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        is.nil(userConfig.env) ? process.env.NODE_ENV : userConfig.env
      )
    });
  }

  // development
  if (process.env.NODE_ENV === 'development') {
    mergeDev(config, userConfig);
  } else {
    mergeProd(config, userConfig);
  }

  // alias
  if (userConfig.alias) {
    config.resolve.alias = Object.assign(config.resolve.alias, userConfig.alias);
  }

  // externals
  if (userConfig.externals) {
    config.externals = userConfig.externals;
  }

  // static
  if (userConfig.static) {
    config.__MIXUP_STATIC__ = userConfig.static;
  }

  return config;
};
