const _set = require('lodash/set');
const _unset = require('lodash/unset');
const getBaseConfig = require('../util/get-base-config');
const merge = require('../util/merge');
const parse = require('../util/parse');
const loadExtend = require('../util/load-extend');

// mix version
exports.version = require('../package.json').version;

// webpack version
exports.webpackVersion = require('webpack/package.json').version;

/**
 * loader.vue => module.rules.vue
 */
const replacePath = function(_path) {
  if (/^((pre|post)?loader)s?/gi.test(_path)) {
    return _path.replace(/^((pre|post)?loader)s?/gi, 'module.rules');
  }

  if (/^(plugin)s?/g.test(_path)) {
    return _path.replace(/^(plugin)s?/g, '$1s');
  }

  return _path;
};

/**
 * set config
 */
exports.set = function(config) {
  config = config || {};

  this.config = merge(config, getBaseConfig(config));

  loadExtend(config.extends, {
    add: this.add,
    remove: this.remove,
    config: this.config,
    _userConfig: config,
    version: exports.version
  });

  return this;
};

/**
 * remove option
 * @param  {string} _path
 * @example
 * mix.remove('loader.js')
 */
exports.remove = function(_path) {
  _unset(this.config, replacePath(_path));

  return this;
};

/**
 * add a option config
 * @param {string} _path - path of config
 * @param {object} value - config
 * @example
 * mix.add('loader.vue', {
 *   test: /\.vue$/,
 *   loaders: ['vue']
 * })
 */
exports.add = function(_path, value) {
  _set(this.config, replacePath(_path), value);

  return this;
};

/**
 * return webpack config
 */
exports.resolve = function() {
  return parse(this.config);
};
