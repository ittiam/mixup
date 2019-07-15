const extractCSS = require('./extract-css');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const calcSourceMap = function(sourceMap) {
  if (sourceMap === true) {
    return '#source-map';
  } else if (sourceMap === false) {
    return false;
  }
  return sourceMap;
};

module.exports = function(config, userConfig) {
  config.mode = 'production';
  config.devtool = calcSourceMap(userConfig.sourceMap);

  // hash
  userConfig.hash = Boolean(userConfig.hash);
  if (userConfig.hash) {
    config.output.filename = 'js/[name].[chunkhash:7].js';
    config.output.chunkFilename = 'js/[id].[chunkhash:7].js';
  }

  const minimize = userConfig.minimize;
  const UglifyJs = new UglifyJsPlugin({
    uglifyOptions: {
      cache: true,
      parallel: true,
      comments: false,
      warnings: false,
      sourceMap: Boolean(userConfig.sourceMap),
      compress: {
        // 移除 console
        drop_console: true,
        drop_debugger: true
      }
    }
  });

  const UglifyCSS = new OptimizeCSSAssetsPlugin({});

  if (is.Boolean(minimize)) {
    if (minimize) {
      config.optimization = {
        minimizer: [UglifyJs, UglifyCSS]
      };
    }
  } else if (is.Object(minimize)) {
    if (minimize.js) {
      config.optimization.minimizer.push(UglifyJs);
    }

    if (minimize.css) {
      config.optimization.minimizer.push(UglifyCSS);
    }
  }

  // clean
  if (is.Boolean(userConfig.clean)) {
    config.__MIXUP_CLEAN__ = userConfig.clean;
  } else {
    config.__MIXUP_CLEAN__ = true;
  }

  extractCSS(userConfig.extractCSS, config, userConfig.hash);

  // chunk
  let chunks = userConfig.chunk;

  if (chunks === true) {
    chunks = {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'all',
          minChunks: 2,
          minSize: 1,
          priority: 0
        },
        // 提取 node_modules 中代码
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10
        }
      }
    };
  }

  config.optimization.splitChunks = chunks;

  /**
   * 提取 webpack 运行时代码
   * optimization.runtimeChunk 直接置为 true 或设置 name
   * webpack会添加一个只包含运行时(runtime)额外代码块到每一个入口
   * 注：这个需要看场景使用，会导致每个入口都加载多一份运行时代码
   * manifest js have already inline to every html file, please run build and see it in html.
   * Maybe we don't need manifest file, because we are a multi-page application. each html page's js maybe not complex.
   * So it depending on how you understand your js file complex or simple.
   */
  if (userConfig.manifest) {
    config.optimization.runtimeChunk = {
      name: 'manifest'
    };
  }
};
