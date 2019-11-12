const vue = require('mixup-plugin-vue');

module.exports = {
  options: {
    assetsDir: 'static',
    filenameHashing: false,
    devServer: {
      open: true,
    },
  },
  use: [vue()],
};
