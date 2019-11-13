const chalk = require('chalk');

module.exports = args => mixup => {
  const { options } = mixup;

  build(args, mixup, options).then(printInstructions);
};

function build(args, mixup, options) {
  const fs = require('fs-extra');
  const webpack = require('webpack');
  const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

  if (args.dest) {
    // Override outputDir before resolving webpack config as config relies on it (#2327)
    options.output = args.dest;
  }

  let clientConfig = mixup.config.toConfig();

  if (args.clean || options.clean) {
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

      resolve({
        stats,
        warnings: messages.warnings,
      });
    });
  });
}

function printInstructions(warnings) {
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
}
