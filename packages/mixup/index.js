const fs = require('fs');
const { resolve, join } = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const chalk = require('chalk');
const logger = require('mixup-dev-utils/logger');
const Mixup = require('./Mixup');
const { webpack, inspect } = require('./handlers');
const webMiddleware = require('./config/middlewares/web');
const cssMiddleware = require('./config/middlewares/css');
const dllMiddleware = require('./config/middlewares/dll');

const extractMiddlewareAndOptions = format =>
  typeof format === 'function' ? { use: [format] } : { ...format };

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

module.exports = (
  context = process.cwd(),
  mode,
  // eslint-disable-next-line global-require, import/no-dynamic-require
  middleware
) => {
  if (mode) {
    // If specified, --mode takes priority and overrides any existing NODE_ENV.
    process.env.NODE_ENV = mode;
  } else if (process.env.MIXUP_CLI_MODE) {
    mode = process.env.MIXUP_CLI_MODE;
  } else if (process.env.NODE_ENV) {
    // Development mode is most appropriate for a !production NODE_ENV (such as `NODE_ENV=test`).
    mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }

  middleware = middleware || loadUserOptions(join(context, 'mixup.config.js'));

  const {
    use,
    options = {},
    configureWebpack,
    chainWebpack,
  } = extractMiddlewareAndOptions(middleware);

  const mixup = new Mixup(context, options);

  if (mode) {
    mixup.config.mode(mode);
    loadEnv(context, mode);
  }
  loadEnv(context);

  mixup.config.context(context);

  mixup.register('webpack', webpack);
  mixup.register('inspect', inspect);

  mixup.use(webMiddleware());
  mixup.use(cssMiddleware());
  mixup.use(dllMiddleware());

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

  if (chainWebpack) {
    mixup.chainWebpack(chainWebpack);
  }
  if (configureWebpack) {
    mixup.configureWebpack(configureWebpack);
  }

  return mixup;
};
