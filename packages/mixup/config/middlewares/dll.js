const Dll = require('../dll');

module.exports = () => mixup => {
  const webpack = require('webpack');
  const { options } = mixup;
  const dllConfig = options.dll;
  const dll = new Dll(mixup.resolveWebpackConfig(), dllConfig);

  if (
    !dllConfig ||
    (typeof dllConfig.enable === 'boolean' && !dllConfig.enable)
  ) {
    return;
  }

  mixup.dll = dll;

  mixup.chainWebpack(config => {
    if (!dll.isOpen || dll.isCommand === true) return;

    const referenceArgs = dll.resolveDllReferenceArgs();

    config.when(referenceArgs.length !== 0, config => {
      // add DllReferencePlugins
      referenceArgs.forEach(args => {
        config
          .plugin(`dll-reference-${args.manifest.name}`)
          .use(webpack.DllReferencePlugin, [args]);
      });

      // auto inject
      if (dll.inject) {
        config
          .plugin('dll-add-asset-html')
          .use(
            require('add-asset-html-webpack-plugin'),
            dll.resolveAddAssetHtmlArgs()
          );
        if (config.plugins.has('copy')) {
          // add copy agrs
          config.plugin('copy').tap(args => {
            args[0][0].ignore.push(dll.outputDir + '/**');
            args[0].push({
              from: dll.outputPath,
              toType: 'dir',
              ignore: ['*.js', '*.css', '*.manifest.json'],
            });
            return args;
          });
        }
      }
    });
  });
};
