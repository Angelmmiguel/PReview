/**
 * Get all the repo files used for the now API
 */
const { resolve } = require('path'),
  glob = require('glob'),
  recursive = require('recursive-readdir'),
  fs = require('fs');

const IGNORED = `.hg
.git
.gitmodules
.svn
.npmignore
.dockerignore
.gitignore
.*.swp
.DS_Store
.wafpicke-*
.lock-wscript
npm-debug.log
config.gypi
node_modules
CVS`;

// Help methods

// Remove leading `./` from the beginning of ignores
const clearRelative = function(str) {
  return str.replace(/(\n|^)\.\//g, '$1')
}

// Sync method
const readSync = function(path, default_ = '') {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (err) {
    console.log(`Error reading the file ${path}: ${err}`);
    return default_;
  }
}

// Transform relative paths into absolutes
const asAbsolute = function(path, parent) {
  return path[0] === '/' ? path : resolve(parent, path);
}

// Read the content of the package.json
const getPackageJSON = path => {
  return fs.readFileSync(resolve(path, 'package.json'));
}

// Get and return all the repository files
const getRepoFiles = srcPath => {
  // Read the package.json
  const pkg = getPackageJSON(srcPath),
    files = pkg.files;

  const search_ = ['.']
  // Convert all filenames into absolute paths
  const search = Array.prototype.concat.apply(
    [],
    search_.map(file => glob(file, { cwd: srcPath, absolute: true, dot: true }))
  );

  // Get files from NPM ignore and others
  const npmIgnore = readSync(resolve(srcPath, '.npmignore')),
    filter = (IGNORED + '\n' + npmIgnore).split('\n');

  // Get the files
  return recursive(srcPath, filter).then(files => {
    let result = {};
    console.log(srcPath)

    files.forEach(file => {
      let name = file.replace(`${srcPath}/`, '');
      if (name === 'package.json') {
        name = 'package';
        result[name] = JSON.parse(readSync(file));
      } else {
        result[name] = readSync(file); //.replace(/(\r\n|\n|\r)/gm, '');
      }
    }, this);

    return result;
  });
}

// Exports
module.exports = {
  getRepoFiles,
  getPackageJSON
}
