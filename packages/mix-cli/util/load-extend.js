'use strict';

const logger = require('./logger');
const isObject = require('./is').Object;
const isArray = require('./is').Array;
const exec = require('./exec');
const pluginExists = require('./check').pluginExists;

/* istanbul ignore next */
const importExtend = (extend, mix, options) => {
  require(`mix-${extend}`)(mix, options);
  logger.success(`Loaded success: ${extend}`);
};

/* istanbul ignore next */
const installExtend = name => {
  logger.warn(`Auto install plugin: ${name}`);
  exec('mix', ['import', name], {
    stdio: 'inherit'
  });
};

/* istanbul ignore next */
/**
 * 加载并装配插件
 * @param  {array} extends
 * @param  {object} config - webpack config
 */
module.exports = (_extends, mix) => {
  const isObj = isObject(_extends);

  Object.keys(_extends || {})
    .reverse()
    .forEach(key => {
      let extend = isObj ? key : _extends[key];
      let options = isObj ? _extends[key] : {};

      if (isArray(extend)) {
        options = extend[1];
        extend = extend[0];
      }

      const extendName = extend.split('@')[0];

      if (!pluginExists(`mix-${extendName}`)) {
        installExtend(extend);
      }

      importExtend(extendName, mix, options);
    });
  console.log();
};
