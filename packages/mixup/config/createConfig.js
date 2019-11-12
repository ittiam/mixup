const { join } = require('path');
const fs = require('fs');
const chalk = require('chalk');
const Mixup = require('../Mixup');
const webMiddleware = require('./middlewares/web');
const cssMiddleware = require('./middlewares/css');

const extractMiddlewareAndOptions = format =>
  typeof format === 'function' ? { ...format, use: format } : { ...format };

const loadUserOptions = configPath => {
  let fileConfig;

  if (fs.existsSync(configPath)) {
    try {
      fileConfig = require(configPath);

      return fileConfig;
    } catch (e) {
      error(`Error loading ${chalk.bold('mixup.config.js')}:`);
      throw e;
    }
  }
};

module.exports = (
  context,
  mode = 'development',
  // eslint-disable-next-line global-require, import/no-dynamic-require
  middleware = loadUserOptions(join(process.cwd(), 'mixup.config.js'))
) => {
  const { use, options = {} } = extractMiddlewareAndOptions(middleware);

  const rawArgv = process.argv.slice(2);
  const args = require('minimist')(rawArgv, {
    boolean: [
      // build
      'modern',
      'report',
      'report-json',
      'watch',
      // serve
      'open',
      'https',
      // inspect
      'verbose',
      // create
      'page',
    ],
  });

  options.args = args;

  const mixup = new Mixup(context, options);

  mixup.config.mode(mode);
  mixup.config.context(context);

  mixup.use(webMiddleware());
  mixup.use(cssMiddleware());

  if (use) {
    try {
      if (Array.isArray(use)) {
        use.forEach(use => mixup.use(use));
      } else {
        mixup.use(use);
      }
    } catch (err) {
      console.error(
        '\nAn error occurred when loading the mixup configuration.\n'
      );
      console.error(err);
      process.exit(1);
    }
  }

  return mixup;
};
