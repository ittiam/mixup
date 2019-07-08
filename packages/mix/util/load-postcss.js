'use strict';

const isArray = require('./is').Array;

module.exports = function(plugins) {
  return isArray(plugins)
    ? () => plugins
    : function() {
        return plugins.apply(this, arguments);
      };
};
