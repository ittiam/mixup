const mpa = require('mixup-plugin-mpa');

module.exports = {
  options: {
    debug: true,
    assetsDir: 'static',
    filenameHashing: false,
    devServer: {
      open: true,
    },
  },
  use: [mpa()],
};
