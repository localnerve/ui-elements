/**
 * Source directory listing
 *
 * Copyright (c) 2017-2024 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
const path = require('path');
const fs = require('fs');
const util = require('util');

/**
 * Given an array of files, return the top level directories, ignoring `ignore`.
 *
 * @param {Array} files - Array of files/directories.
 * @param {String} rootDir - The rootDir that produced `files`.
 * @param {Array} ignore - Array of directories to ignore.
 * @returns {Array} Top level directories in rootDir.
 */
function getTLDirsFromFiles (files, rootDir, ignore) {
  return files
    .filter((file) => {
      const isDir = fs.statSync(path.join(rootDir, file)).isDirectory();
      return isDir ? ignore.indexOf(file) === -1 : false;
    })
    .map(file => path.join(rootDir, file));
}

/**
 * Searches `root` for top level directories with ignores.
 *
 * @param {String} rootDir - The root directory to search.
 * @param {Array} tlIgnore - TL directories to ignore.
 * @returns {Promise} Resolves to an array of toplevel directories under rootDir.
 */
function getTLDirs (rootDir, tlIgnore) {
  return util.promisify(fs.readdir)(rootDir)
    .then(files => getTLDirsFromFiles(files, rootDir, tlIgnore));
}

/**
 * Synchronous getTLDirs
 * @see getTLDirs
 */
function getTLDirsSync (rootDir, tlIgnore) {
  return getTLDirsFromFiles(fs.readdirSync(rootDir), rootDir, tlIgnore);
}

const srcRoot = path.join(__dirname, '..');
const srcIgnores = [
  'utils'
];

/**
 * Searches `srcRoot` for top level directories, ignore `srcIgnores` directories.
 *
 * @returns {Promise} Resolves to an array of toplevel directories under srcRoot.
 */
function getSourceDirs () {
  return getTLDirs(srcRoot, srcIgnores);
}

/**
 * Synchronous getSourceDirs.
 * @see getSourceDirs.
 */
function getSourceDirsSync () {
  return getTLDirsSync(srcRoot, srcIgnores);
}

module.exports = {
  getTLDirs,
  getTLDirsSync,
  getSourceDirs,
  getSourceDirsSync,
  srcRoot: path.resolve(srcRoot)
};
