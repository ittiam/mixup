const { join } = require('path');
const Mixup = require('../Mixup');
const webMiddleware = require('./middlewares/web');
const cssMiddleware = require('./middlewares/css');

const extractMiddlewareAndOptions = format =>
  typeof format === 'function' ? { ...format, use: format } : { ...format };

module.exports = (
  context,
  mode = 'development',
  // eslint-disable-next-line global-require, import/no-dynamic-require
  middleware = require(join(process.cwd(), 'mixup.config.js'))
) => {
  const { use, options } = extractMiddlewareAndOptions(middleware);

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
