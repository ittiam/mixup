const path = require('path');
const clone = require('lodash.clonedeep');
const Config = require('webpack-chain');
const merge = require('webpack-merge');
const semver = require('semver');
const { isAbsolute, join } = require('path');
const printError = require('mixup-dev-utils/printError');
const { source } = require('./extensions');

const getRoot = ({ root }) => root;
const normalizePath = (base, path) =>
  isAbsolute(path) ? path : join(base, path);
const pathOptions = [
  ['root', '', () => process.cwd()],
  ['source', 'src', getRoot],
  ['output', 'dist', getRoot],
  ['tests', 'test', getRoot],
];

// Support both a shorter string form and an object form that allows
// specifying any page-specific options supported by the preset.
const normalizeMainConfig = config =>
  typeof config === 'string' ? { entry: config } : config;

function cloneRuleNames(to, from) {
  if (!to || !from) {
    return;
  }
  from.forEach((r, i) => {
    if (to[i]) {
      Object.defineProperty(to[i], '__ruleNames', {
        value: r.__ruleNames,
      });
      cloneRuleNames(to[i].oneOf, r.oneOf);
    }
  });
}

module.exports = class Mixup {
  constructor(context, options) {
    this.context = context;
    this.options = this.getOptions(options);
    this.config = new Config();
    this.outputHandlers = new Map();
    this.devServerConfigFns = [];
    this.webpackRawConfigFns = [];
  }

  getOptions(opts = {}) {
    const options = {
      debug: false,
      root: this.context,
      // Default to an absolute public path, so pushState API sites work.
      // Apps deployed to a subdirectory will need to override this.
      // https://webpack.js.org/configuration/output/#output-publicpath
      publicPath: '/',

      // where to output built files
      output: '',

      inlineLimit: 4096,

      // where to put static assets (js/css/img/font/...)
      assetsDir: '',

      manifest: false,

      // filename for index.html (relative to outputDir)
      indexPath: 'index.html',

      // html-webpack-plugin options
      html: {},

      // whether filename will contain hash part
      filenameHashing: true,

      // boolean, use full build?
      runtimeCompiler: false,

      // deps to transpile
      transpile: [],

      // sourceMap for production build?
      productionSourceMap: true,

      // multi-page config
      pages: undefined,

      // <script type="module" crossorigin="use-credentials">
      // #1656, #1867, #2025
      crossorigin: undefined,

      // subresource integrity
      integrity: false,

      // remove the dist directory before building the project
      clean: true,

      babel: {},

      css: {
        // extract: true,
        // modules: false,
        // sourceMap: false,
        // loaderOptions: {}
      },

      devServer: {
        /*
          open: process.platform === 'darwin',
          host: '0.0.0.0',
          port: 8000,
          https: false,
          hotOnly: false,
          proxy: null, // string | Object
          before: app => {}
        */
      },
      extensions: new Set(source),
      ...clone(opts),
    };

    let moduleExtensions = options.extensions;

    pathOptions.forEach(([path, defaultValue, getNormalizeBase]) => {
      let value = options[path] || defaultValue;

      Reflect.defineProperty(options, path, {
        enumerable: true,
        get() {
          return normalizePath(getNormalizeBase(options), value);
        },
        set(newValue) {
          value = newValue || defaultValue;
        },
      });
    });

    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      options.packageJson = require(join(options.root, 'package.json'));
    } catch (err) {
      options.packageJson = null;
    }

    Object.defineProperty(options, 'extensions', {
      enumerable: true,
      get() {
        return [...moduleExtensions];
      },
      set(extensions) {
        moduleExtensions = new Set(extensions.map(ext => ext.replace('.', '')));
      },
    });

    return options;
  }

  regexFromExtensions(extensions = this.options.extensions) {
    const exts = extensions.map(ext => ext.replace('.', '\\.'));

    return new RegExp(
      extensions.length === 1
        ? String.raw`\.${exts[0]}$`
        : String.raw`\.(${exts.join('|')})$`
    );
  }

  getDependencyVersion(dependency) {
    const { dependencies = {}, devDependencies = {} } =
      this.options.packageJson || {};

    return (
      (dependency in dependencies || dependency in devDependencies) &&
      semver.coerce(dependencies[dependency] || devDependencies[dependency])
    );
  }

  register(name, handler) {
    this.outputHandlers.set(name, handler);
  }

  use(middleware) {
    if (!middleware) {
      return;
    }

    if (typeof middleware === 'function') {
      middleware(this);
    } else {
      printError(new Error('middleware can only be passed as functions.'));
    }
  }

  resolve(_path) {
    return path.resolve(this.context, _path);
  }

  resolveWebpackConfig() {
    let config = this.config.toConfig();

    const original = config;
    // apply raw config fns
    this.webpackRawConfigFns.forEach(fn => {
      if (typeof fn === 'function') {
        // function with optional return value
        const res = fn(config);
        if (res) config = merge(config, res);
      } else if (fn) {
        // merge literal values
        config = merge(config, fn);
      }
    });

    // #2206 If config is merged by merge-webpack, it discards the __ruleNames
    // information injected by webpack-chain. Restore the info so that
    // vue inspect works properly.
    if (config !== original) {
      cloneRuleNames(
        config.module && config.module.rules,
        original.module && original.module.rules
      );
    }

    if (typeof config.entry !== 'function') {
      let entryFiles;
      if (typeof config.entry === 'string') {
        entryFiles = [config.entry];
      } else if (Array.isArray(config.entry)) {
        entryFiles = config.entry;
      } else {
        entryFiles = Object.values(config.entry || []).reduce(
          (allEntries, curr) => {
            return allEntries.concat(curr);
          },
          []
        );
      }

      entryFiles = entryFiles.map(file => path.resolve(this.context, file));
      process.env.MIXUP_CLI_ENTRY_FILES = JSON.stringify(entryFiles);
    }

    return config;
  }

  configureWebpack(fn) {
    this.webpackRawConfigFns.push(fn);
  }

  /**
   * Register a dev serve config function. It will receive the express `app`
   * instance of the dev server.
   *
   * @param {function} fn
   */
  configureDevServer(fn) {
    this.devServerConfigFns.push(fn);
  }
};
