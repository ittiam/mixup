#!/usr/bin/env node
'use strict';

const mixup = require('..');
const script = process.argv[2];

const service = mixup(process.env.MIXUP_CLI_CONTEXT || process.cwd());

service.run(script);
