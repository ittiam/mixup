var mix = require('@mixup/mix');
const getBaseConfig = require('@mixup/mix/util/get-base-config');
const merge = require('@mixup/mix/util/merge');
const loadExtend = require('../util/load-extend');

exports.set = function(config) {
  config = config || {};
  this.config = merge(config, getBaseConfig(config));

  loadExtend(config.extends, {
    add: this.add,
    remove: this.remove,
    config: this.config,
    _userConfig: config,
    version: mix.version
  });

  return this;
};

exports.add = mix.add;
exports.remove = mix.remove;
exports.resolve = mix.resolve;
