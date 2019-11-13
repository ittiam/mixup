#!/usr/bin/env node
'use strict';

const yargs = require('yargs');
const chalk = require('chalk');
const init = require('../commands/init');
const page = require('../commands/page');

yargs
  .usage('Usage: $0 <command> [options]')
  .alias('v', 'version')
  .help()
  .alias('h', 'help')
  .command(init)
  .command(page)
  .epilogue(
    `Run ${chalk.cyan(
      `mixup-cli <command> --help`
    )} for detailed usage of given command.`
  )
  .demandCommand().argv;
