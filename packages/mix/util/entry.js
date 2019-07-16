const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const appDirectory = fs.realpathSync(process.cwd());

function rootPath(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

/**
 * 获取入口文件名列表
 * @return {Array} 入口名数组
 */
function getViews(VIEWS_DIR, entryGlob) {
  const entries = getEntries(VIEWS_DIR, `${process.cwd()}/${entryGlob}`);
  return entries;
}

/**
 * 获取指定路径下的入口文件
 * @param  {String} globPath 通配符路径
 * @param  {String} preDep 前置模块
 * @return {Object}          入口名:路径 键值对
 * {
 *   viewA: ['a.js'],
 *   viewB: ['b.js']
 * }
 */
function getEntries(VIEWS_DIR, globPath, preDep = []) {
  const files = glob.sync(rootPath(globPath));
  const getViewName = filepath => {
    const dirname = path.dirname(path.relative(`${VIEWS_DIR}/`, filepath));
    // 兼容组件，src/index.js
    return dirname === '..' ? 'index' : dirname;
  };

  // glob 按照字母顺序取 .js 与 .ts 文件
  // 通过 reverse 强制使 js 文件在 ts 之后，达到覆盖目的
  // 保证 index.js 优先原则
  return files.reverse().reduce((entries, filepath) => {
    const name = getViewName(filepath);
    // preDep 支持数组或字符串。所以这里使用 concat 方法
    entries[name] = [].concat(preDep, filepath);

    return entries;
  }, {});
}

function getEntryPoints(globPath, preDep = []) {
  const files = glob.sync(rootPath(globPath));
  const getTrunkName = filepath => {
    const basename = path.posix.basename(filepath, '.js');
    return basename.replace(/^index\./, '') + '.servant';
  };

  return files.reduce((chunks, filepath) => {
    const name = getTrunkName(filepath);
    // preDep 支持数组或字符串。所以这里使用 concat 方法
    chunks[name] = [].concat(preDep, filepath);

    return chunks;
  }, {});
}

function hasHtml(htmlTemplatePath) {
  return fs.existsSync(htmlTemplatePath);
}

module.exports = {
  rootPath,
  getViews,
  getEntries,
  getEntryPoints,
  hasHtml
};
