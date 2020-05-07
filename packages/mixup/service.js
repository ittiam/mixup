const createMixup = require('./');

const modes = {
  inspect: 'development',
  start: 'development',
  build: 'production',
  dll: 'production',
};

module.exports = (
  context,
  // eslint-disable-next-line global-require, import/no-dynamic-require
  middleware
) => {
  let mixup = null;

  function init(mode) {
    return mixup || createMixup(context, mode, middleware);
  }

  const service = {
    output(name) {
      if (!mixup) {
        throw new Error(`Please first init Mixup`);
      }

      const handler = mixup.outputHandlers.get(name);

      if (!handler) {
        throw new Error(`Unable to find an output handler named "${name}"`);
      }

      return handler(mixup);
    },

    run(script, args) {
      const mode =
        args.mode ||
        (script === 'build' && args.watch ? 'development' : modes[script]);

      let mixup = init(mode);

      const command = require('./config/commands/' + script)(args);

      mixup.use(command);
    },
  };

  return service;
};
