const extractCSS = require('./extract-css');
const is = require('./is');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

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

  const UglifyJs = new TerserPlugin({
    terserOptions: {
      parse: {
        // we want terser to parse ecma 8 code. However, we don't want it
        // to apply any minfication steps that turns valid ecma 5 code
        // into invalid ecma 5 code. This is why the 'compress' and 'output'
        // sections only apply transformations that are ecma 5 safe
        // https://github.com/facebook/create-react-app/pull/4234
        ecma: 8
      },
      compress: {
        ecma: 5,
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebook/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false,
        // Disabled because of an issue with Terser breaking valid code:
        // https://github.com/facebook/create-react-app/issues/5250
        // Pending futher investigation:
        // https://github.com/terser-js/terser/issues/120
        inline: 2
      },
      mangle: {
        safari10: true
      },
      output: {
        ecma: 5,
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebook/create-react-app/issues/2488
        ascii_only: true
      }
    },
    // Use multi-process parallel running to improve the build speed
    // Default number of concurrent runs: os.cpus().length - 1
    parallel: true,
    // Enable file caching
    cache: true,
    sourceMap: Boolean(userConfig.sourceMap)
  });

  const UglifyCSS = new OptimizeCSSAssetsPlugin({
    cssProcessorOptions: {
      map: Boolean(userConfig.sourceMap)
        ? {
            // `inline: false` forces the sourcemap to be output into a
            // separate file
            inline: false,
            // `annotation: true` appends the sourceMappingURL to the end of
            // the css file, helping the browser find the sourcemap
            annotation: true
          }
        : false
    },
    canPrint: false // 不显示通知
  });

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
