const fs = require('fs')

module.exports = {
  fs, require, // for test (injecting referecnes)

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
  importAllFrom(pathFromRoot, options) {
    const files = this.getFilesFrom(pathFromRoot)
    const fileReducer = this.createFileReducer(pathFromRoot, options)

    return files.reduce(fileReducer, [])
  },

  getFilesFrom(pathFromRoot) {
    return this.fs.readdirSync(pathFromRoot)
  },

  createFileReducer(pathFromRoot, options) {
    const pathFromHere = this.getPathFromHereFrom(pathFromRoot)
    const concatedOptions = this.concatDefaultOptions(options)
    const env = {
      pathFromRoot,
      pathFromHere,
      options: concatedOptions
    }
    return (...args) => this.fileReducer(env, ...args)
  },

  getPathFromHereFrom(pathFromRoot) {
    return pathFromRoot.replace(/^./, '..')
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
    if (this.isValidFile(env, file)) {
      results.push(
        this.require(`${env.pathFromHere}/${file}`)
      )
    }
  },

  isValidFile(env, file) {
    return this.optionsChecker(env.options, `${env.pathFromRoot}/${file}`)
  },

  optionsChecker(options, filePath) {
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
