'use strict';

const create = require('./command/create');
const messages = require('./lib/messages');

module.exports = {
  messages: messages,
  create: create,
};
