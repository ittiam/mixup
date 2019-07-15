const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

modele.exports = function(extractcss, config, hash) {
  if (!extractcss) {
    return;
  }

  let filename = extractcss;

  config.extractCSS = true;

  if (extractcss === true) {
    filename = hash ? 'css/[name].[contenthash:7].css' : 'css/[name].css';
  }
  // import plugin
  config.plugins.ExtractText = new MiniCssExtractPlugin({
    filename: filename,
    chunkFilename: hash ? 'css/[name].[contenthash:7].chunk.css' : 'css/[name].chunk.css'
  });

  // update css loader
  const sourceMap = config.sourceMap ? '?sourceMap' : '';

  config.module.rules.css = {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: sourceMap
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: sourceMap
        }
      }
    ]
  };
};
