'use strict';

const path = require('path');

const defaultPolyfills = [
  // promise polyfill alone doesn't work in IE
  'es.array.iterator',

  'es.promise',

  // this is needed for object rest spread support in templates
  // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
  'es.object.assign',
  // #2012 es6.promise replaces native Promise in FF and causes missing finally
  'es.promise.finally',
];

function getPolyfills(
  targets,
  includes,
  { ignoreBrowserslistConfig, configPath }
) {
  const { isPluginRequired } = require('@babel/preset-env');
  const builtInsList = require('core-js-compat/data');
  const getTargets = require('@babel/preset-env/lib/targets-parser').default;
  const builtInTargets = getTargets(targets, {
    ignoreBrowserslistConfig,
    configPath,
  });

  return includes.filter(item => {
    return isPluginRequired(builtInTargets, builtInsList[item]);
  });
}

module.exports = (context, options = {}) => {
  let presets = [];
  let plugins = [];

  const defaultEntryFiles = JSON.parse(
    process.env.MIXUP_CLI_ENTRY_FILES || '[]'
  );

  const runtimePath = path.dirname(
    require.resolve('@babel/runtime/package.json')
  );

  const {
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    targets,
    spec,
    ignoreBrowserslistConfig = false,
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy,
    // entry file list
    entryFiles = defaultEntryFiles,

    absoluteRuntime = runtimePath,
  } = options;

  // included-by-default polyfills. These are common polyfills that 3rd party
  // dependencies may rely on (e.g. Vuex relies on Promise), but since with
  // useBuiltIns: 'usage' we won't be running Babel on these deps, they need to
  // be force-included.
  let polyfills;
  if (useBuiltIns === 'usage') {
    polyfills = getPolyfills(targets, userPolyfills || defaultPolyfills, {
      ignoreBrowserslistConfig,
      configPath,
    });
    plugins.push([
      require('./polyfillsPlugin'),
      { polyfills, entryFiles, useAbsolutePath: !!absoluteRuntime },
    ]);
  } else {
    polyfills = [];
  }

  const envOptions = {
    corejs: 3,
    spec,
    loose,
    debug,
    modules,
    targets,
    useBuiltIns,
    ignoreBrowserslistConfig,
    configPath,
    include,
    exclude: polyfills.concat(exclude || []),
    shippedProposals,
    forceAllTransforms,
  };

  // pass options along to babel-preset-env
  presets.push([require('@babel/preset-env'), envOptions]);

  // additional <= stage-3 plugins
  // Babel 7 is removing stage presets altogether because people are using
  // too many unstable proposals. Let's be conservative in the defaults here.
  plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [
      require('@babel/plugin-proposal-decorators'),
      {
        decoratorsBeforeExport,
        legacy: decoratorsLegacy !== false,
      },
    ],
    [require('@babel/plugin-proposal-class-properties'), { loose }]
  );

  // transform runtime, but only for helpers
  plugins.push([
    require('@babel/plugin-transform-runtime'),
    {
      regenerator: useBuiltIns !== 'usage',

      // polyfills are injected by preset-env & polyfillsPlugin, so no need to add them again
      corejs: false,

      helpers: useBuiltIns === 'usage',

      useESModules: false,

      absoluteRuntime,
    },
  ]);

  return {
    sourceType: 'unambiguous',
    overrides: [
      {
        exclude: [/@babel[\/|\\\\]runtime/, /core-js/],
        presets,
        plugins,
      },
      {
        // there are some untranspiled code in @babel/runtime
        // https://github.com/babel/babel/issues/9903
        include: [/@babel[\/|\\\\]runtime/],
        presets: [
          [
            require('@babel/preset-env'),
            {
              useBuiltIns,
              corejs: 3,
            },
          ],
        ],
      },
    ],
  };
};
