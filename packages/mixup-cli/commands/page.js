'use strict';

const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const { prompt } = require('inquirer');
const asyncCommand = require('../lib/async-command');

module.exports = asyncCommand({
  command: 'page <name>',
  desc: 'create a new page',
  async handler(argv) {},
});
