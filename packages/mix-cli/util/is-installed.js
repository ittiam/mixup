'use strict';
const cp = require('child_process');

module.exports = name => {
  try {
    cp.execSync('node -e \'require.resolve("' + name + '")\'', {
      stdio: 'ignore',
      env: {
        NODE_PATH: process.env.NODE_PATH
      }
    });

    return true;
  } catch (err) {
    return false;
  }
};
