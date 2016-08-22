const fs = require('fs')
const pathUtil = require('path')

module.exports = {
  fs, pathUtil, require, // for test (injecting referecnes)

  defaultOptions: {
    file: true,
    dir: true
  },

  /**
   *  import all files from given path
   *
   *  @method importAllFrom
   *  @param {String} pathFromRoot Path from root to destination
   *  @param {Object} options Settings for import criteria (regexp, file, dir)
   *  @return {Array} An array containing all imported files
   */
  importAllFrom(path, options) {
    const files = this.getFilesFrom(path)
    const fileReducer = this.createFileReducer(path, options)

    return files.reduce(fileReducer, [])
  },

  getFilesFrom(path) {
    return this.fs.readdirSync(path)
  },

  createFileReducer(path, options) {
    const concatedOptions = this.concatDefaultOptions(options)
    const env = {
      path,
      options: concatedOptions
    }
    return (...args) => this.fileReducer(env, ...args)
  },

  concatDefaultOptions(options) {
    return Object.assign({}, this.defaultOptions, options)
  },

  fileReducer(env, results, file) {
    try {
      this.importFileTo(results, {env, file})
    } finally {
      return results
    }
  },

  importFileTo(results, {env, file}) {
    const filePath = this.getFilePath(env.path, file)

    if (this.isValidFile(env.options, filePath)) {
      results.push(this.require(filePath))
    }
  },

  getFilePath(path, file) {
    return this.pathUtil.join(path, file)
  },

  isValidFile(options, filePath) {
    const fileStat = this.fs.statSync(filePath)

    return (
      this.fileOptionChecker(options.file, fileStat) &&
      this.dirOptionChecker(options.dir, fileStat) &&
      this.regexpOptionChecker(options.regexp, filePath)
    )
  },

  fileOptionChecker(fileOption, fileStat) {
    return fileOption ? true : !(fileStat.isFile())
  },

  dirOptionChecker(dirOption, fileStat) {
    return dirOption ? true : !(fileStat.isDirectory())
  },

  regexpOptionChecker(regexpOption, filePath) {
    return (regexpOption instanceof RegExp) ?
      regexpOption.test(filePath) : true
  }
}
