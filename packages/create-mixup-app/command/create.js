'use strict';

const path = require('path');
const fs = require('fs');
const copyDir = require('../lib/utils/copy-dir');
const install = require('../lib/utils/install');
const messages = require('../lib/messages');

module.exports = async function create(opts) {
  const projectName = opts.projectName;

  if (!projectName) {
    console.log(messages.missingProjectName());
    process.exit(1);
  }

  if (fs.existsSync(projectName)) {
    console.log(messages.alreadyExists(projectName));
    process.exit(1);
  }

  const projectPath = (opts.projectPath = process.cwd() + '/' + projectName);

  const templateName =
    opts.template && opts.template !== 'default'
      ? `project-${opts.template}`
      : 'default';

  const templatePath = path.resolve(__dirname, `../templates/${templateName}`);

  await copyDir({
    templatePath: templatePath,
    projectPath: projectPath,
    projectName: projectName,
  }).then(installWithMessageFactory(opts));
};

function installWithMessageFactory(opts, isExample = false) {
  const projectName = opts.projectName;
  const projectPath = opts.projectPath;

  return function installWithMessage() {
    return install({
      projectName: projectName,
      projectPath: projectPath,
      packages: ['@mixup/mixup'],
    })
      .then(function() {
        console.log(messages.start(projectName));
      })
      .catch(function(err) {
        throw err;
      });
  };
}
