const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function resolveFile(assetsPath, filename) {
  return `${assetsPath}/${filename}`;
}

module.exports = function(extractcss, config, hash, assetsPath = 'static') {
  if (!extractcss) {
    return;
  }

  const assetsPath = assetsPath + '/' + 'css';

  let filename = extractcss;

  config.extractCSS = true;

  if (extractcss === true) {
    filename = hash
      ? resolveFile(assetsPath, '[name].[contenthash:7].css')
      : resolveFile(assetsPath, '[name].css');
  }
  // import plugin
  config.plugins.ExtractText = new MiniCssExtractPlugin({
    filename: filename,
    chunkFilename: hash
      ? resolveFile(assetsPath, '[name].[contenthash:7].chunk.css')
      : resolveFile(assetsPath, '[name].chunk.css')
  });

  // update css loader
  const sourceMap = config.sourceMap ? 'sourceMap' : '';

  config.module.rules.css = {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
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
      }
    ]
  };
};
