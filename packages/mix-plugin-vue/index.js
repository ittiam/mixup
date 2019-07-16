var load = require('./less-loader');

module.exports = function(mix) {
  const SOURCE_MAP = mix.config.devtool;

  let loaders = load({
    sourceMap: SOURCE_MAP ? '#source-map' : false,
    extractCSS: !!mix.config.extractCSS
  });

  mix.add('loader.less', {
    test: /\.less$/,
    use: loaders
  });
};
