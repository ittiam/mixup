const fs = require('fs');
const path = require('path');
const glob = require('glob');
const merge = require('deepmerge');
const logger = require('mixup-dev-utils/logger');
const resolveClientEnv = require('mixup-dev-utils/resolveClientEnv');

function ensureRelative(outputDir, _path) {
  if (path.isAbsolute(_path)) {
    return path.relative(outputDir, _path);
  } else {
    return _path;
  }
}

/**
 * 获取入口文件名列表
 * @return {Array} 入口名数组
 */
function getViews(VIEWS_DIR, entryGlob) {
  const entries = getEntries(VIEWS_DIR, entryGlob);

  return entries;
}

/**
 * 获取指定路径下的入口文件
 * @param  {String} globPath 通配符路径
 * @param  {String} preDep 前置模块
 * @return {Object}          入口名:路径 键值对
 * {
 *   viewA: 'a.js',
 *   viewB: 'b.js'
 * }
 */
function getEntries(VIEWS_DIR, globPath) {
  const files = glob.sync(globPath);

  const getViewName = filepath => {
    const dirname = path.dirname(path.relative(`${VIEWS_DIR}/`, filepath));
    // 兼容组件，src/index.js
    return dirname === '..' ? 'index' : dirname;
  };

  // glob 按照字母顺序取 .js 与 .ts 文件
  // 通过 reverse 强制使 js 文件在 ts 之后，达到覆盖目的
  // 保证 index.js 优先原则
  return files.reverse().reduce((entries, filepath) => {
    const name = getViewName(filepath);
    // preDep 支持数组或字符串。所以这里使用 concat 方法
    entries[name] = filepath;

    return entries;
  }, {});
}

module.exports = (opts = {}) => mixup => {
  const options = merge(
    {
      views: 'views',
      pages: undefined,
    },
    opts
  );

  const HTMLPlugin = require('html-webpack-plugin');
  const isProduction = process.env.NODE_ENV === 'production';
  const VIEWS_DIR = mixup.resolve(`src/${options.views}`);
  const entryGlob =
    options.entryGlob || `${VIEWS_DIR}/*/index.@(ts|tsx|js|jsx)`;
  const defaultHtmlPath = path.resolve(__dirname, 'index-default.html');
  const htmlPath = mixup.resolve('public/index.html');
  const outputDir = mixup.resolve(mixup.options.output);

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
        resolveClientEnv(mixup.options, true /* raw */)
      );
    },
  };

  if (isProduction) {
    Object.assign(
      htmlOptions,
      {
        minify: {
          removeComments: false,
          collapseWhitespace: false,
          removeAttributeQuotes: false,
          collapseBooleanAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
      },
      mixup.options.html
    );
  }

  if (!fs.existsSync(VIEWS_DIR)) {
    logger.error(`Please create views root src/${options.views}`);
  }

  const webpackConfig = mixup.config;

  webpackConfig.entryPoints.clear();
  webpackConfig.plugins.delete('html');

  let multiPageConfig = options.pages;
  if (!multiPageConfig) {
    multiPageConfig = getViews(VIEWS_DIR, entryGlob);
  }

  mixup.options.pages = multiPageConfig;

  const pages = Object.keys(multiPageConfig);
  const normalizePageConfig = c => (typeof c === 'string' ? { entry: c } : c);

  pages.forEach(name => {
    const pageConfig = normalizePageConfig(multiPageConfig[name]);

    const {
      entry,
      template = `src/${options.views}/${name}/index.html`,
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

    webpackConfig.entry(name).merge(entries);

    // resolve page index template
    const hasDedicatedTemplate = fs.existsSync(mixup.resolve(template));
    const templatePath = hasDedicatedTemplate
      ? template
      : fs.existsSync(htmlPath)
      ? htmlPath
      : defaultHtmlPath;

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

    if (mixup.options.html) {
      webpackConfig.plugin(`html-${name}`).use(HTMLPlugin, [pageHtmlOptions]);
    }
  });
};
