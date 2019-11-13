'use strict';

const create = require('./create');
const options = require('./options');
const asyncCommand = require('../lib/async-command');

module.exports = asyncCommand({
  command: 'create <project-name> [options]',
  desc: 'create a new project powered by @mixup/mixup',
  builder(yargs) {
    yargs.options(options);
  },
  async handler(argv) {
    await create(argv);
  },
});
