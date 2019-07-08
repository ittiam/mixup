'use strict';

const logger = require('./logger');
const isObject = require('./is').Object;
const pluginExists = require('./check').pluginExists;

/* istanbul ignore next */
const importExtend = function(extend, mix, options) {
  require(`mix-${extend}`)(mix, options);
  logger.success(`Loaded success: ${extend}`);
};

/* istanbul ignore next */
/**
 * 加载并装配插件
 * @param  {array} extends
 * @param  {object} config - webpack config
 */
module.exports = function(_extends, mix) {
  const isObj = isObject(_extends);

  Object.keys(_extends || {}).forEach(key => {
    const extend = isObj ? key : _extends[key];
    const options = isObj ? _extends[key] : {};
    const extendName = extend.split('@')[0];
    const packageName = `mix-${extendName}`;

    if (!pluginExists(packageName)) {
      logger.fatal(`Please install ${packageName}, run 'npm i ${packageName} -D'`);
    }

    importExtend(extendName, mix, options);
  });
  console.log();
};
