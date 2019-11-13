const path = require('path');
const clone = require('lodash.clonedeep');
const Config = require('webpack-chain');
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

module.exports = class Mixup {
  constructor(context, options) {
    this.context = context;
    this.options = this.getOptions(options);
    this.config = new Config();
    this.outputHandlers = new Map();
  }

  getOptions(opts = {}) {
    const options = {
      debug: false,
      root: this.context,
      // Default to an absolute public path, so pushState API sites work.
      // Apps deployed to a subdirectory will need to override this.
      // https://webpack.js.org/configuration/output/#output-publicpath
      baseUrl: '/',

      // where to output built files
      output: '',

      // where to put static assets (js/css/img/font/...)
      assetsDir: '',

      // filename for index.html (relative to outputDir)
      indexPath: 'index.html',

      // html-webpack-plugin options
      html: {},

      // whether filename will contain hash part
      filenameHashing: true,

      // boolean, use full build?
      runtimeCompiler: false,

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
};
