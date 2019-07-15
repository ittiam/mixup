var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(options) {
  options = options || {};
  // generate loader string to be used with extract text plugin
  function generateLoaders(loaders) {
    if (options.postcss) {
      loaders.splice(loaders.length - 1, 0, 'postcss');
    }

    var sourceLoader = loaders
      .map(function(loader) {
        var extraParamChar;
        if (/\?/.test(loader)) {
          loader = loader.replace(/\?/, '-loader?');
          extraParamChar = '&';
        } else {
          loader = loader + '-loader';
          extraParamChar = '?';
        }
        return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
      })
      .join('!');

    if (options.extract) {
      return ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: sourceLoader
      });
    } else {
      return ['style-loader', sourceLoader].join('!');
    }
  }

  return {
    less: generateLoaders(['css', 'less'])
  };
};
