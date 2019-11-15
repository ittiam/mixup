const { join } = require('path');
const fs = require('fs');
const chalk = require('chalk');
const logger = require('mixup-dev-utils/logger');
const Mixup = require('./Mixup');
const { webpack, inspect } = require('./handlers');
const webMiddleware = require('./config/middlewares/web');
const cssMiddleware = require('./config/middlewares/css');

const extractMiddlewareAndOptions = format =>
  typeof format === 'function' ? { ...format, use: format } : { ...format };

const loadUserOptions = configPath => {
  let fileConfig;

  if (fs.existsSync(configPath)) {
    try {
      fileConfig = require(configPath);

      return fileConfig;
    } catch (e) {
      logger.error(`Error loading ${chalk.bold('mixup.config.js')}:`);

      throw e;
    }
  }
};

const modes = {
  inspect: 'development',
  start: 'development',
  build: 'production',
};

module.exports = (
  context,
  // eslint-disable-next-line global-require, import/no-dynamic-require
  middleware = loadUserOptions(join(process.cwd(), 'mixup.config.js'))
) => {
  const { use, options = {}, configureWebpack } = extractMiddlewareAndOptions(
    middleware
  );
  const rawArgv = process.argv.slice(2);
  const args = require('minimist')(rawArgv, {
    boolean: [
      // build
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

  const command = args._[0];
  const mode =
    args.mode ||
    process.env.MIXUP_CLI_MODE ||
    (command === 'build' && args.watch ? 'development' : modes[command]);

  const mixup = new Mixup(context, options);

  if (mode) {
    // If specified, --mode takes priority and overrides any existing NODE_ENV.
    process.env.NODE_ENV = mode;
  } else if (process.env.NODE_ENV) {
    // Development mode is most appropriate for a !production NODE_ENV (such as `NODE_ENV=test`).
    mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  } else {
    // Default NODE_ENV to the more strict value, to save needing to do so in .eslintrc.js.
    // However don't set `mode` since webpack already defaults it to `production`, and in so
    // doing outputs a useful message informing users that they are relying on the defaults.
    process.env.NODE_ENV = 'production';
  }

  if (mode) {
    mixup.config.mode(mode);
  }

  mixup.config.context(context);

  mixup.register('webpack', webpack);
  mixup.register('inspect', inspect);

  mixup.use(webMiddleware());
  mixup.use(cssMiddleware());

  if (configureWebpack) {
    mixup.configureWebpack(configureWebpack);
  }

  if (use) {
    try {
      if (!Array.isArray(use)) {
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

  const adapter = {
    output(name) {
      const handler = mixup.outputHandlers.get(name);

      if (!handler) {
        throw new Error(`Unable to find an output handler named "${name}"`);
      }

      return handler(mixup);
    },

    run(script) {
      const command = require('./config/commands/' + script)(args);

      mixup.use(command);
    },
  };

  return new Proxy(adapter, {
    get(object, property) {
      return property === 'run' || property === 'output'
        ? Reflect.get(object, property)
        : Reflect.get(object, 'output').bind(object, property);
    },
  });
};
