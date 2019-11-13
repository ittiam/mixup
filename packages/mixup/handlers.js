const { highlight } = require('cli-highlight');

const webpack = mixup => {
  return mixup.config.toConfig();
};

const config = mixup => {
  return mixup.config;
};

const options = mixup => {
  return mixup.options;
};

const inspect = mixup => {
  const stringifiedConfig = mixup.config.toString({
    configPrefix: 'mixup.config',
    verbose: true,
  });

  console.log(highlight(stringifiedConfig, { language: 'js' }));
};

module.exports = {
  config,
  options,
  webpack,
  inspect,
};
