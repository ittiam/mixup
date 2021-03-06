let service = process.MIXUP_CLI_SERVICE;

if (!service || process.env.MIXUP_CLI_API_MODE) {
  service = require('./service')(
    process.env.MIXUP_CLI_CONTEXT || process.cwd()
  );
}

module.exports = service.output('webpack');
