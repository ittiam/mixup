'use strict';

const path = require('path');
const PLUGIN_PATH = require('../util/path').PLUGIN_PATH;
const info = require(path.join(PLUGIN_PATH, 'package.json'));
const dependencies = info.dependencies;

module.exports = function(program) {
  for (var name in dependencies) {
    if (/^mix-(\S+)-command$/.test(name)) {
      const commandName = name.replace(/^mix-(\S+)-command$/, '$1');
      const description = require(path.join(name, 'package.json')).description;
      const action = (_name => () => require(_name)(program))(name);
      const command = program.command(commandName);

      command.allowUnknownOption();
      command.description(description);
      try {
        require(path.join(name, 'options'))(command);
      } catch (_) {
        // options.js 文件不存在则不处理
      }
      command.action(action);
    }
  }
};
