const react = require('mixup-plugin-react');

module.exports = {
  options: {
    debug: true,
    assetsDir: 'static',
    filenameHashing: false,
    devServer: {
      open: true,
    },
  },
  use: [react()],
};
