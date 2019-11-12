const mpa = require('mixup-plugin-mpa');

module.exports = {
  options: {
    assetsDir: 'static',
    filenameHashing: false,
    devServer: {
      open: true,
    },
  },
  use: [mpa()],
};
