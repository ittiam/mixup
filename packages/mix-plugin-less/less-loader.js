const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function(options) {
  options = options || {};

  const sourceMap = options.sourceMap || false;
  const extractCSS = options.extractCSS || false;

  const loaders = [
    extractCSS ? MiniCssExtractPlugin.loader : 'style-loader',
    {
      loader: 'css-loader',
      options: {
        sourceMap: !!sourceMap
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: !!sourceMap
      }
    },
    {
      loader: 'less-loader',
      options: {
        sourceMap: !!sourceMap
      }
    }
  ];

  return loaders;
};
