'use strict';

const createMixup = require('./lib');
const messages = require('./lib/messages');

module.exports = {
  messages: messages,
  createMixupApp: createMixup
};
