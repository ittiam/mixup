const prefixRE = /^MIXUP_APP_/;
const ENV_SHOULD_PASS = ['NODE_ENV', 'SOCKET_SERVER'];

module.exports = function resolveClientEnv(options, raw) {
  const env = {};

  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || ENV_SHOULD_PASS.includes(key)) {
      env[key] = process.env[key];
    }
  });
  env.BASE_URL = options.publicPath;

  if (raw) {
    return env;
  }

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }
  return {
    'process.env': env,
  };
};
