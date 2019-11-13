#!/usr/bin/env node
'use strict';

const mixup = require('..');
const script = process.argv[2];

const service = mixup(process.env.MIXUP_CLI_CONTEXT || process.cwd());

switch (script) {
  case 'build':
  case 'start':
  case 'inspect': {
    service.run(script);
    break;
  }
  default:
    console.log('Unknown script "' + script + '".');
    break;
}
