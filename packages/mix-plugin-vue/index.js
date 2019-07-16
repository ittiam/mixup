const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = function(mix, options) {
  // add extension
  mix.config.resolve.extensions.push('.vue');

  // add loader
  mix.add('loader.vue', {
    test: /\.vue$/,
    loader: 'vue-loader'
  });

  mix.add('plugin.VueLoaderPlugin', new VueLoaderPlugin());
};
