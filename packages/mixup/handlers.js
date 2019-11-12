const webpack = mixup => {
  return mixup.config.toConfig();
};

const inspect = mixup => {
  const stringifiedConfig = mixup.config.toString({
    configPrefix: 'mixup.config',
    verbose: true,
  });
  console.log(stringifiedConfig);
};

module.exports = {
  webpack,
  inspect,
};
