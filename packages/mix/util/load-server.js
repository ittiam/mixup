'use strict';

const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const isObject = require('./is').Object;

const defaultServer = {
  port: 8080,
  enable: true,
  disableHostCheck: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
  hot: true,
  hotOnly: true,
  clientLogLevel: 'none',
  quiet: true,
  historyApiFallback: {
    disableDotRule: true
  },
  lazy: false,
  stats: 'errors-only',
  host: '0.0.0.0',
  overlay: false,
  before(app, server) {
    // This lets us fetch source contents from webpack for the error overlay
    app.use(evalSourceMapMiddleware(server));
    // This lets us open files from the runtime error overlay.
    app.use(errorOverlayMiddleware());
  }
};

module.exports = server => {
  // null, undefined, false
  if (!server || server === false) {
    return {
      enable: false,
      stats: 'errors-only'
    };
  }

  // object
  if (isObject(server)) {
    const config = Object.assign(defaultServer, server);

    config.host = config.hostname || config.host || defaultServer.host;
    config.__host__ = `${config.https ? 'https' : 'http'}://${config.host}:${config.port}`;
    delete config.hostname;

    return config;
  }

  // array, string, true, number .etc
  return defaultServer;
};
