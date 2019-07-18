module.exports = function(mix) {
  mix.config.resolve.extensions.unshift('.ts', '.tsx');

  mix.add('loader.typescript', {
    test: /\.(ts|tsx)$/,
    use: 'ts-loader'
  });
};
