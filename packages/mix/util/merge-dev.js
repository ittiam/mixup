const extractCSS = require('./extract-css');
const is = require('./is');

const calcSourceMap = function(sourceMap) {
  if (sourceMap === true) {
    return 'cheap-module-source-map';
  } else if (sourceMap === false) {
    return false;
  }
  return sourceMap;
};

module.exports = function(config, userConfig) {
  config.mode = 'development';
  config.devtool = userConfig.sourceMap === true ? 'cheap-module-source-map' : userConfig.sourceMap;
  config.devServer = userConfig.devServer;

  // extractCSS
  if (userConfig.devServer) {
    extractCSS(userConfig.devServer.extractCSS, config, false);

    // clean
    if (is.Boolean(userConfig.devServer.clean)) {
      config.__MIXUP_CLEAN__ = userConfig.devServer.clean;
    } else {
      config.__MIXUP_CLEAN__ = true;
    }
  }

  // devtool
  if (!config.devServer || (is.Object(config.devServer) && config.devServer.enable === false)) {
    config.devtool = calcSourceMap(userConfig.sourceMap);
  }
};
