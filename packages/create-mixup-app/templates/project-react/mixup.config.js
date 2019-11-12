const react = require('mixup-plugin-react');

module.exports = {
  options: {
    assetsDir: 'static',
    filenameHashing: false,
    devServer: {
      open: true,
    },
  },
  use: [react()],
};
