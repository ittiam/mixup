const { highlight } = require('cli-highlight');

const webpack = mixup => {
  return mixup.resolveWebpackConfig();
};

const inspect = mixup => {
  const stringifiedConfig = mixup.config.toString({
    configPrefix: 'mixup.config',
    verbose: true,
  });

  console.log(highlight(stringifiedConfig, { language: 'js' }));
};

module.exports = {
  webpack,
  inspect,
};
