#!/usr/bin/env node
'use strict';
const { join, isAbsolute } = require('path');

const script = process.argv[2];
const rawArgv = process.argv.slice(2);
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'watch',
    'report',
    'report-json',
    // serve
    'open',
    'https',
    // inspect
    'verbose',
    // create
    'page',
  ],
});

function toAbsolute(p) {
  if (isAbsolute(p)) {
    return p;
  }
  return join(process.cwd(), p);
}

const { MIXUP_CLI_CONTEXT } = process.env;

const service = require('../service')(
  MIXUP_CLI_CONTEXT ? toAbsolute(MIXUP_CLI_CONTEXT) : process.cwd()
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
