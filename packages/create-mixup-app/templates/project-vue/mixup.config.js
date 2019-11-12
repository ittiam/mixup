const vue = require('mixup-plugin-vue');

module.exports = {
  options: {
    debug: true,
    assetsDir: 'static',
    filenameHashing: false,
    devServer: {
      open: true,
    },
  },
  use: [vue()],
};
