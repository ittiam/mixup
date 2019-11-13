#! /usr/bin/env node

const chalk = require('chalk');
const create = require('./command/create');
const options = require('./command/options');
const parseArgv = require('./lib/parseArgv');

const argv = parseArgv(options);
const appName = argv._[0];

if (typeof appName === 'undefined') {
  // start with new line
  console.log();

  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan('mixup-cli create')} ${chalk.green('<project-name>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan('mixup-cli create')} ${chalk.green('my-app')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${'mixup-cli create'} --help`)} to see all options.`
  );

  process.exit(1);
}

// mock positional arguments
argv.projectName = argv['project-name'] = appName;

create(argv);
