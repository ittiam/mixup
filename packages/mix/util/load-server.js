'use strict';

const path = require('path');
const fs = require('fs-extra');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const apiMocker = require('mocker-api');
const isObject = require('./is').Object;
const { rootPath } = require('./entry');
const watchFile = path.resolve(rootPath('mock'), 'index.js');
const hasWatchFile = fs.existsSync(watchFile);

const defaultServer = {
  // 允许修改 host 模拟跨域
  disableHostCheck: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
  // Enable gzip compression of generated files
  compress: true,
  clientLogLevel: 'none',
  // WebpackDevServer is noisy by default so we emit custom message instead
  // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
  quiet: true,
  port: 9000,
  enable: true,
  hot: true,
  hotOnly: true,
  overlay: false,
  open: true,
  host: '127.0.0.1'
};

module.exports = server => {
  // null, undefined, false
  if (!server || server === false) {
    return {
      enable: false,
      stats: 'errors-only'
    };
  }

  let mockOptions = {};

  // object
  if (isObject(server)) {
    const config = Object.assign(defaultServer, server);

    config.host = config.hostname || config.host || defaultServer.host;
    config.__host__ = `${config.https ? 'https' : 'http'}://${config.host}:${config.port}`;
    delete config.hostname;

    if (config.mock) {
      mockOptions = config.mock;
      delete config.mock;
    }

    config.before = (app, server) => {
      app.use(evalSourceMapMiddleware(server));
      app.use(errorOverlayMiddleware());

      if (hasWatchFile) {
        apiMocker(app, watchFile, mockOptions);
      }
    };

    return config;
  }

  // array, string, true, number .etc
  return defaultServer;
};
