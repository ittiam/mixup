'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const is = require('./is');
const logger = require('./logger');

module.exports = template => {
  let templates = {};

  if (template === true) {
    templates['index.html'] = new HtmlWebpackPlugin();
  } else if (is.String(template)) {
    templates['index.html'] = new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(process.cwd(), template)
    });
  } else if (is.Object(template)) {
    for (var name in template) {
      if ({}.hasOwnProperty.call(template, name)) {
        if (is.String(template[name])) {
          templates[name] = new HtmlWebpackPlugin({
            filename: name,
            template: template[name]
          });
        } else {
          template[name].filename = template[name].filename || name;
          templates[name] = new HtmlWebpackPlugin(template[name]);
        }
      }
    }
  } else if (is.Array(template)) {
    template.forEach(item => {
      if (!item.filename) {
        logger.fatal('template filename is required.');
      }
      templates[item.filename] = new HtmlWebpackPlugin(item);
    });
  }

  return templates;
};
