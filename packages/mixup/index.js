const { join, resolve } = require('path');
const fs = require('fs');
const chalk = require('chalk');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
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

const loadEnv = (context, mode) => {
  const basePath = resolve(context, `.env${mode ? `.${mode}` : ``}`);
  const localPath = `${basePath}.local`;

  const load = envPath => {
    try {
      const env = dotenv.config({ path: envPath, debug: process.env.DEBUG });
      dotenvExpand(env);
    } catch (err) {
      // only ignore error if file is not found
      if (err.toString().indexOf('ENOENT') < 0) {
        error(err);
      }
    }
  };

  load(localPath);
  load(basePath);
};

const modes = {
  inspect: 'development',
  start: 'development',
  build: 'production',
};

module.exports = (
  context,
  // eslint-disable-next-line global-require, import/no-dynamic-require
  middleware
) => {
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
  let mode =
    args.mode ||
    process.env.MIXUP_CLI_MODE ||
    (command === 'build' && args.watch ? 'development' : modes[command]);

  if (mode) {
    loadEnv(context, mode);
  }
  loadEnv(context);

  if (mode) {
    // If specified, --mode takes priority and overrides any existing NODE_ENV.
    process.env.NODE_ENV = mode;
  } else if (process.env.NODE_ENV) {
    // Development mode is most appropriate for a !production NODE_ENV (such as `NODE_ENV=test`).
    mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  } else {
    mode = 'development';

    process.env.NODE_ENV = mode;
  }

  const { use, options = {}, configureWebpack } = extractMiddlewareAndOptions(
    middleware ||
      loadUserOptions(join(context || process.cwd(), 'mixup.config.js'))
  );

  const mixup = new Mixup(context, options);

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
