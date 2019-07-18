var mix = require('@mixup/mix');

mix.set({
  entry: './src/index.js',
  template: './src/index.html',
  dist: './dist',
  devServer: {
    port: 8085,
    publicPath: '/'
  },
  publicPath: '/',
  extractCSS: true,
  minimize: true,
  clean: true,
  hash: true,
  sourceMap: true,
  extends: ['less', 'vue'],
  manifest: {}
});

module.exports = mix.resolve();
