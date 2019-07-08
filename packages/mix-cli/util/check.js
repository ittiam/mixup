'use strict';

const path = require('path');
const fs = require('fs');
const updateNotifier = require('update-notifier');
const shelljs = require('shelljs');
const pkg = require('../package.json');
const PLUGIN_PATH = require('./path').PLUGIN_PATH;
const CWD_PATH = require('./path').CWD_PATH;
const ROOT_PATH = require('./path').ROOT_PATH;

exports.registry = function(registry) {
  if (!registry) {
    return '';
  }

  return '--registry=' + registry;
};

/* istanbul ignore next */
exports.initPluginPackage = function() {
  if (!fs.existsSync(PLUGIN_PATH)) {
    fs.mkdirSync(PLUGIN_PATH);
  }

  var pluginPkg = path.join(PLUGIN_PATH, 'package.json');

  if (!fs.existsSync(pluginPkg)) {
    fs.writeFileSync(pluginPkg, '{}');
  }
};

/* istanbul ignore next */
exports.checkPermission = function() {
  const tmpFile = path.join(PLUGIN_PATH, 'tmp');

  fs.writeFileSync(path.join(PLUGIN_PATH, 'tmp'));
  shelljs.rm(tmpFile);
};

/* istanbul ignore next */
exports.checkVersion = function() {
  var notifier = updateNotifier({ pkg });

  notifier.notify();
};

/* istanbul ignore next */
exports.pluginExists = function(name) {
  return fs.existsSync(path.join(PLUGIN_PATH, 'node_modules', name)) || exports.localExists(name);
};

/* istanbul ignore next */
exports.localExists = function(name) {
  return fs.existsSync(path.join(CWD_PATH, 'node_modules', name));
};

/* istanbul ignore next */
exports.isYarn = function() {
  return ROOT_PATH.indexOf('yarn') > -1;
};
