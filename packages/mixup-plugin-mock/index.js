module.exports = opts => mixup => {
  const apiMocker = require('mocker-api');
  const glob = require('glob');
  const { join } = require('path');

  const options = Object.assign(
    {
      exclude: [],
    },
    opts
  );

  function getMockFiles() {
    let mockFiles = glob
      .sync('mock/**/*.[jt]s', {
        cwd: mixup.context,
        ignore: options.exclude || [],
      })
      .map(p => join(mixup.context, p));

    return mockFiles;
  }

  mixup.configureDevServer((app, server) => {
    const mockFiles = getMockFiles();

    apiMocker(app, mockFiles, options);
  });
};
