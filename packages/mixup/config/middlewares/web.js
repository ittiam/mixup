const path = require('path');
const fs = require('fs');

function ensureRelative(outputDir, _path) {
  if (path.isAbsolute(_path)) {
    return path.relative(outputDir, _path);
  } else {
    return _path;
  }
}

module.exports = opts => mixup => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const resolveLocal = require('../../util/resolveLocal');
  const getAssetPath = require('../../util/getAssetPath');
  const resolveClientEnv = require('../../util/resolveClientEnv');
  const HTMLPlugin = require('html-webpack-plugin');
  const inlineLimit = 4096;
  const { options, config } = mixup;
  const webpackConfig = config;

  const multiPageConfig = options.pages;
  const htmlPath = mixup.resolve('public/index.html');
  const defaultHtmlPath = path.resolve(__dirname, 'index-default.html');
  const publicCopyIgnore = ['.DS_Store'];
  const outputDir = mixup.resolve(options.output);

  const genAssetSubPath = dir => {
    return getAssetPath(
      options,
      `${dir}/[name]${options.filenameHashing ? '.[hash:8]' : ''}.[ext]`
    );
  };

  const genUrlLoaderOptions = dir => {
    return {
      limit: inlineLimit,
      // use explicit fallback to avoid regression in url-loader>=1.1.0
      fallback: {
        loader: 'file-loader',
        options: {
          name: genAssetSubPath(dir),
        },
      },
    };
  };

  const htmlOptions = {
    templateParameters: (compilation, assets, pluginOptions) => {
      // enhance html-webpack-plugin's built in template params
      let stats;
      return Object.assign(
        {
          // make stats lazy as it is expensive
          get webpack() {
            return stats || (stats = compilation.getStats().toJson());
          },
          compilation: compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: pluginOptions,
          },
        },
        resolveClientEnv(options, true /* raw */)
      );
    },
  };

  webpackConfig
    .entry('app')
    .add('./src/main.js')
    .end()
    .output.path(options.output)
    .filename('[name].js')
    .publicPath(options.baseUrl);

  webpackConfig.resolve.extensions
    .merge(['.js', '.jsx', '.json'])
    .end()
    .modules.add('node_modules')
    .add(mixup.resolve('node_modules'))
    .add(resolveLocal('node_modules'))
    .end()
    .alias.set('@', mixup.resolve('src'));

  webpackConfig.resolveLoader.modules
    .add('node_modules')
    .add(mixup.resolve('node_modules'))
    .add(resolveLocal('node_modules'));

  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options(genUrlLoaderOptions('img'));

  // do not base64-inline SVGs.
  // https://github.com/facebookincubator/create-react-app/pull/1180
  webpackConfig.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader(require.resolve('file-loader'))
    .options({
      name: genAssetSubPath('img'),
    });

  webpackConfig.module
    .rule('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options(genUrlLoaderOptions('media'));

  webpackConfig.module
    .rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options(genUrlLoaderOptions('fonts'));

  webpackConfig
    .plugin('define')
    .use(require('webpack/lib/DefinePlugin'), [resolveClientEnv(options)]);

  webpackConfig
    .plugin('case-sensitive-paths')
    .use(require('case-sensitive-paths-webpack-plugin'));

  // friendly error plugin displays very confusing errors when webpack
  // fails to resolve a loader, so we provide custom handlers to improve it
  const { transformer, formatter } = require('../../util/resolveLoaderError');
  webpackConfig
    .plugin('friendly-errors')
    .use(require('@soda/friendly-errors-webpack-plugin'), [
      {
        additionalTransformers: [transformer],
        additionalFormatters: [formatter],
      },
    ]);

  const TerserPlugin = require('terser-webpack-plugin');
  const terserOptions = require('./terserOptions');
  webpackConfig.optimization
    .minimizer('terser')
    .use(TerserPlugin, [terserOptions(options)]);

  // #1669 html-webpack-plugin's default sort uses toposort which cannot
  // handle cyclic deps in certain cases. Monkey patch it to handle the case
  // before we can upgrade to its 4.0 version (incompatible with preload atm)
  const chunkSorters = require('html-webpack-plugin/lib/chunksorter');
  const depSort = chunkSorters.dependency;
  chunkSorters.auto = chunkSorters.dependency = (chunks, ...args) => {
    try {
      return depSort(chunks, ...args);
    } catch (e) {
      // fallback to a manual sort if that happens...
      return chunks.sort((a, b) => {
        // make sure user entry is loaded last so user CSS can override
        // vendor CSS
        if (a.id === 'app') {
          return 1;
        } else if (b.id === 'app') {
          return -1;
        } else if (a.entry !== b.entry) {
          return b.entry ? -1 : 1;
        }
        return 0;
      });
    }
  };

  if (process.env.NODE_ENV !== 'test') {
    webpackConfig.optimization.splitChunks({
      cacheGroups: {
        vendors: {
          name: `chunk-vendors`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: `chunk-common`,
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    });
  }

  if (isDevelopment) {
    webpackConfig
      .devtool('cheap-module-eval-source-map')
      .output.publicPath(options.baseUrl);

    webpackConfig
      .plugin('hmr')
      .use(require('webpack/lib/HotModuleReplacementPlugin'));

    webpackConfig
      .plugin('no-emit-on-errors')
      .use(require('webpack/lib/NoEmitOnErrorsPlugin'));

    if (!process.env.MIXUP_CLI_TEST && options.devServer.progress !== false) {
      webpackConfig
        .plugin('progress')
        .use(require('webpack/lib/ProgressPlugin'));
    }
  }

  if (isProduction) {
    webpackConfig
      .mode('production')
      .devtool(options.productionSourceMap ? 'source-map' : false);

    const outputFilename = getAssetPath(
      options,
      `js/[name]${options.filenameHashing ? '.[contenthash:8]' : ''}.js`
    );
    webpackConfig.output.filename(outputFilename).chunkFilename(outputFilename);

    Object.assign(htmlOptions, {
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true,
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
    });

    // keep chunk ids stable so async chunks have consistent hash (#1916)
    webpackConfig
      .plugin('named-chunks')
      .use(require('webpack/lib/NamedChunksPlugin'), [
        chunk => {
          if (chunk.name) {
            return chunk.name;
          }

          const hash = require('hash-sum');
          const joinedHash = hash(
            Array.from(chunk.modulesIterable, m => m.id).join('_')
          );
          return `chunk-` + joinedHash;
        },
      ]);

    // keep module.id stable when vendor modules does not change
    webpackConfig
      .plugin('hash-module-ids')
      .use(require('webpack/lib/HashedModuleIdsPlugin'), [
        {
          hashDigest: 'hex',
        },
      ]);

    if (process.env.VUE_CLI_TEST) {
      webpackConfig.optimization.minimize(false);
    }
  }

  if (!multiPageConfig) {
    // default, single page setup.
    htmlOptions.template = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;

    publicCopyIgnore.push({
      glob: path.relative(
        mixup.resolve('public'),
        mixup.resolve(htmlOptions.template)
      ),
      matchBase: false,
    });

    webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
  } else {
    // multi-page setup
    webpackConfig.entryPoints.clear();

    const pages = Object.keys(multiPageConfig);
    const normalizePageConfig = c => (typeof c === 'string' ? { entry: c } : c);

    pages.forEach(name => {
      const pageConfig = normalizePageConfig(multiPageConfig[name]);
      const {
        entry,
        template = `public/${name}.html`,
        filename = `${name}.html`,
        chunks = ['chunk-vendors', 'chunk-common', name],
      } = pageConfig;

      // Currently Cypress v3.1.0 comes with a very old version of Node,
      // which does not support object rest syntax.
      // (https://github.com/cypress-io/cypress/issues/2253)
      // So here we have to extract the customHtmlOptions manually.
      const customHtmlOptions = {};
      for (const key in pageConfig) {
        if (!['entry', 'template', 'filename', 'chunks'].includes(key)) {
          customHtmlOptions[key] = pageConfig[key];
        }
      }

      // inject entry
      const entries = Array.isArray(entry) ? entry : [entry];
      webpackConfig.entry(name).merge(entries.map(e => mixup.resolve(e)));

      // resolve page index template
      const hasDedicatedTemplate = fs.existsSync(mixup.resolve(template));
      const templatePath = hasDedicatedTemplate
        ? template
        : fs.existsSync(htmlPath)
        ? htmlPath
        : defaultHtmlPath;

      publicCopyIgnore.push({
        glob: path.relative(
          mixup.resolve('public'),
          mixup.resolve(templatePath)
        ),
        matchBase: false,
      });

      // inject html plugin for the page
      const pageHtmlOptions = Object.assign(
        {},
        htmlOptions,
        {
          chunks,
          template: templatePath,
          filename: ensureRelative(outputDir, filename),
        },
        customHtmlOptions
      );

      webpackConfig.plugin(`html-${name}`).use(HTMLPlugin, [pageHtmlOptions]);
    });
  }

  // copy static assets in public/
  const publicDir = mixup.resolve('public');
  if (fs.existsSync(publicDir)) {
    webpackConfig.plugin('copy').use(require('copy-webpack-plugin'), [
      [
        {
          from: publicDir,
          to: outputDir,
          toType: 'dir',
          ignore: publicCopyIgnore,
        },
      ],
    ]);
  }
};
