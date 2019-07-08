'use strict';

module.exports = function(config) {
  if (!process.env.MIXUP_PATH) {
    return;
  }
  const rootPath = process.env.MIXUP_PATH.split(',');

  config.resolve = config.resolve || {};
  config.resolveLoader = config.resolveLoader || {};

  config.resolve.modules = (config.resolve.root || []).concat(rootPath);
  config.resolveLoader.modules = (config.resolveLoader.root || []).concat(rootPath);
};
