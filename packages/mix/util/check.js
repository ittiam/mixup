'use strict'

const path = require('path')
const fs = require('fs')

/* istanbul ignore next */
exports.pluginExists = function (name) {
  return fs.existsSync(path.join(process.cwd(), 'node_modules', name))
}

exports.isNextWebpack = require('webpack/package.json').version.split('.')[0] > 1
