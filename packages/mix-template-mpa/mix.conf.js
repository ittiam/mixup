var mix = require('@mixup/mix');

mix.set({
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
  extends: ['less'],
  manifest: {}
});

module.exports = mix.resolve();
