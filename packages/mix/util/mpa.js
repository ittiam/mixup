const fs = require('fs-extra');
const { getViews } = require('./entry');

module.exports = function(config) {
  const options = config.mpa || {};
  const VIEWS_DIR = `src/${options.views || 'views'}`;
  const entryGlob = options.entryGlob || `${VIEWS_DIR}/*/index.@(ts|tsx|js|jsx)`;
  const entries = getViews(VIEWS_DIR, entryGlob);
  const views = Object.keys(entries);
  let htmls = [];

  if (views.length) {
    views.forEach(entry => {
      const htmlTemplatePath = `${VIEWS_DIR}/${entry}/index.html`;
      const hasHtml = fs.existsSync(htmlTemplatePath);
      let chunks = [];

      if (config.chunks) {
        chunks.push('vendor');
      }

      chunks.push(entry);

      if (hasHtml) {
        const p = {
          filename: `${entry}.html`,
          template: htmlTemplatePath,
          inject: true,
          chunks: chunks
        };

        htmls.push(p);
      }
    });

    config.entry = entries;
    config.template = htmls;
  }
};
