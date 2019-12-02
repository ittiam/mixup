#!/usr/bin/env node
'use strict';

const script = process.argv[2];

const rawArgv = process.argv.slice(2);
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'watch',
    // serve
    'open',
    'https',
    // inspect
    'verbose',
    // create
    'page',
  ],
});

const service = require('../service')(
  process.env.MIXUP_CLI_CONTEXT || process.cwd()
);

switch (script) {
  case 'build':
  case 'start':
  case 'inspect': {
    service.run(script, args);
    break;
  }
  default:
    console.log('Unknown script "' + script + '".');
    break;
}
