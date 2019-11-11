#! /usr/bin/env node
'use strict';
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production';

const fs = require('fs-extra');
const webpack = require('webpack');
const chalk = require('chalk');
const createConfig = require('../config/createConfig');
const printError = require('mixup-dev-utils/printError');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

function build() {
  // Create our production webpack configurations and pass in mixup options.
  let mixup = createConfig(
    process.env.MIXUP_CLI_CONTEXT || process.cwd(),
    'production'
  );

  const { options } = mixup;

  let clientConfig = mixup.config.toConfig();

  if (options.clean) {
    fs.removeSync(mixup.resolve(options.output));
  }

  console.log('Creating an optimized production build...');

  // First compile the client. We need it to properly output assets.json (asset
  // manifest file with the correct hashes on file names BEFORE we can start
  // the server compiler.

  return new Promise((resolve, reject) => {
    webpack(clientConfig, (err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        let errMessage = err.message;

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            err['postcssNode'].selector;
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }

      return resolve({
        stats,
        warnings: messages.warnings,
      });
    });
  });
}

build()
  .then(
    ({ stats, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      } else {
        console.log(chalk.green('Compiled successfully.\n'));
      }
    },
    err => {
      console.log(chalk.red('Failed to compile.\n'));
      printError(err);
      process.exit(1);
    }
  )
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
