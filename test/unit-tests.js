const utils = require('../utils')
const expect = require('chai').expect
const sinon = require('sinon')

describe('unit tests', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should pass this canary test', () => {
    expect(true).to.be.true
  })

  describe('importAllFrom tests', () => {
    const path = 'path'
    const options = {}
    // stub results
    const files = {}
    const fileReducer = function () {}

    beforeEach(() => {
      files.reduce = sandbox.stub()
        .withArgs(fileReducer).returns('resultFromReduce')

      sandbox.stub(utils, 'getFilesFrom')
        .withArgs(path).returns(files)
      sandbox.stub(utils, 'createFileReducer')
        .withArgs(path, options).returns(fileReducer)
    })

    it('should call getFilesFrom with given pathFromRoot', () => {
      utils.importAllFrom(path, options)

      expect(
        utils.getFilesFrom
          .calledWithExactly(path)
      ).to.be.true
    })

    it('should call createFileReducer with pathFromRoot and options', () => {
      utils.importAllFrom(path, options)

      expect(
        utils.createFileReducer
          .calledWithExactly(path, options)
      ).to.be.true
    })

    it('should call reduce of result from getFilesFrom, with result from createFileReducer and empty array', () => {
      utils.importAllFrom(path, options)

      expect(
        files.reduce
          .calledWithExactly(fileReducer, [])
      ).to.be.true
    })

    it('should return result from reduce of files', () => {
      const result = utils.importAllFrom(path, options)

      expect(result).to.be.equal('resultFromReduce')
    })
  })

  describe('getFilesFrom tests', () => {
    const path = 'path'

    beforeEach(() => {
      sandbox.stub(utils, 'fs', {
        readdirSync: sandbox.stub()
          .withArgs(path).returns('resultFromReaddirSync')
      })
    })

    it('should call readdirSync of fs with given pathFromRoot', () => {
      utils.getFilesFrom(path)

      expect(
        utils.fs.readdirSync
          .calledWithExactly(path)
      ).to.be.true
    })

    it('should return result from readdirSync of fs', () => {
      const result = utils.getFilesFrom(path)

      expect(result).to.be.equal('resultFromReaddirSync')
    })
  })

  describe('createFileReducer tests', () => {
    const path = 'path'
    const options = {}
    // stub results
    const concatOptions = {}

    beforeEach(() => {
      sandbox.stub(utils, 'concatDefaultOptions')
        .returns(concatOptions)
    })

    it('should call concatDefaultOptions with options', () => {
      utils.createFileReducer(path, options)

      expect(
        utils.concatDefaultOptions
          .calledWithExactly(options)
      ).to.be.true
    })

    it('should return a function which will call fileReducer with an object containing pathFromRoot, pathFromHere and options, and arguments passed to it', () => {
      sandbox.stub(utils, 'fileReducer')
        .returns('resultFromfileReducer')

      const fileReducer = utils.createFileReducer(path, options)

      expect(fileReducer).to.be.instanceof(Function)

      const env = {
        path,
        options: concatOptions
      }
      const args = ['arg1', 'arg2', 'arg3']

      const result = fileReducer(...args)

      expect(
        utils.fileReducer
          .calledWithExactly(env, ...args)
      ).to.be.true
      expect(result).to.be.equal('resultFromfileReducer')
    })
  })

  describe('concatDefaultOptions tests', () => {
    it('should return default options given undefined options', () => {
      const result = utils.concatDefaultOptions()

      expect(result).to.be.eql({
        file: true,
        dir: true
      })
    })

    it('should override default options with given options and return', () => {
      const result = utils.concatDefaultOptions({
        regexp: /test/,
        file: false
      })
      expect(result).to.be.eql({
        regexp: /test/,
        file: false,
        dir: true
      })
    })
  })

  describe('fileReducer tests', () => {
    const env = {}
    const results = []
    const file = 'file'

    beforeEach(() => {
      sandbox.stub(utils, 'importFileTo')
    })

    it('should call importFileTo with results and an object containing env and file', () => {
      utils.fileReducer(env, results, file)

      expect(
        utils.importFileTo
          .calledWithExactly(results, {env, file})
      ).to.be.true
    })

    it('should return results given no error threw from importFileTo', () => {
      const result = utils.fileReducer(env, results, file)

      expect(result).to.be.equal(results)
    })

    it('should return results given error threw from importFileTo', () => {
      utils.importFileTo.throws(new Error())

      const result = utils.fileReducer(env, results, file)

      expect(result).to.be.equal(results)
    })
  })

  describe('importFileTo tests', () => {
    const env = {
      path: 'path',
      options: {}
    }
    const file = 'file'
    // stub results
    const filePath = 'filePath'

    let results

    beforeEach(() => {
      results = []

      sandbox.stub(utils, 'isValidFile')
      sandbox.stub(utils, 'getFilePath')
        .returns(filePath)
      sandbox.stub(utils, 'require')
        .returns('resultFromRequire')
    })

    it('should call getFilePath with env.path and file', () => {
      utils.importFileTo(results, {env, file})

      expect(
        utils.getFilePath
          .calledWithExactly(env.path, file)
      ).to.be.true
    })

    it('should call isValidFile with env.options and filePath from getFilePath', () => {
      utils.importFileTo(results, {env, file})

      expect(
        utils.isValidFile
          .calledWithExactly(env.options, filePath)
      ).to.be.true
    })

    it('should call require with filePath from getFilePath given isValidFile returns true', () => {
      utils.isValidFile.returns(true)

      utils.importFileTo(results, {env, file})

      expect(
        utils.require
          .calledWithExactly(filePath)
      ).to.be.true
    })

    it('should add result from require to results given isValidFile returns true', () => {
      utils.isValidFile.returns(true)

      utils.importFileTo(results, {env, file})

      expect(results).to.be.eql(['resultFromRequire'])
    })

    it('should not manipulate results and not call require given isValidFile returns false', () => {
      utils.isValidFile.returns(false)

      utils.importFileTo(results, {env, file})

      expect(results).to.be.eql([])
      expect(utils.require.called).to.be.false
    })
  })

  describe('getFilePath tests', () => {
    const path = 'path'
    const file = 'file'

    beforeEach(() => {
      sandbox.stub(utils.pathUtil, 'join')
        .returns('resultFromJoin')
    })

    it('should call join of pathUtils with path and file then return', () => {
      const result = utils.getFilePath(path, file)

      expect(
        utils.pathUtil.join
          .calledWithExactly(path, file)
      ).to.be.true
      expect(result).to.be.equal('resultFromJoin')
    })
  })

  describe('isValidFile tests', () => {
    const options = {
      regexp: /test/,
      file: true,
      dir: false
    }
    const filePath = 'filePath'
    const fileStat = 'fileStat'

    beforeEach(() => {
      sandbox.stub(utils, 'fs', {
        statSync: sandbox.stub().returns(fileStat)
      })
      sandbox.stub(utils, 'fileOptionChecker')
      sandbox.stub(utils, 'dirOptionChecker')
      sandbox.stub(utils, 'regexpOptionChecker')
    })

    it('should call statSync of fs with filePath', () => {
      utils.isValidFile(options, filePath)

      expect(
        utils.fs.statSync
          .calledWithExactly(filePath)
      ).to.be.true
    })

    it('should call fileOptionChecker with options.file and fileStat', () => {
      utils.isValidFile(options, filePath)

      expect(
        utils.fileOptionChecker
          .calledWithExactly(options.file, fileStat)
      ).to.be.true
    })

    it('should call dirOptionChecker with options.dir and fileStat when fileOptionChecker return true', () => {
      utils.fileOptionChecker.returns(true)

      utils.isValidFile(options, filePath)

      expect(
        utils.dirOptionChecker
          .calledWithExactly(options.dir, fileStat)
      ).to.be.true
    })

    it('should call regexpOptionChecker with options.regexp and filePath when fileOptionChecker and dirOptionChecker return true', () => {
      utils.fileOptionChecker.returns(true)
      utils.dirOptionChecker.returns(true)

      utils.isValidFile(options, filePath)

      expect(
        utils.regexpOptionChecker
          .calledWithExactly(options.regexp, filePath)
      ).to.be.true
    })

    it('should return true only when all checkers return true', () => {
      const results = []

      utils.fileOptionChecker.returns(true)
      utils.dirOptionChecker.returns(true)
      utils.regexpOptionChecker.returns(true)
      results.push(utils.isValidFile(options, filePath))

      utils.regexpOptionChecker.returns(false)
      results.push(utils.isValidFile(options, filePath))

      utils.dirOptionChecker.returns(false)
      results.push(utils.isValidFile(options, filePath))

      utils.fileOptionChecker.returns(false)
      results.push(utils.isValidFile(options, filePath))

      expect(results).to.be.eql([true, false, false, false])
    })
  })

  describe('fileOptionChecker tests', () => {
    let fileStat

    beforeEach(() => {
      fileStat = {
        isFile: sandbox.stub()
      }
    })

    it('should return true given fileOption is true', () => {
      const fileOption = true

      const result = utils.fileOptionChecker(fileOption, fileStat)

      expect(result).to.be.true
    })

    it('should return false given fileOption is false and isFile of fileStat return true', () => {
      const fileOption = false

      fileStat.isFile.returns(true)

      const result = utils.fileOptionChecker(fileOption, fileStat)

      expect(result).to.be.false
    })
  })

  describe('dirOptionChecker tests', () => {
    let fileStat

    beforeEach(() => {
      fileStat = {
        isDirectory: sandbox.stub()
      }
    })

    it('should return true given dirOption is true', () => {
      const dirOption = true

      const result = utils.dirOptionChecker(dirOption, fileStat)

      expect(result).to.be.true
    })

    it('should return false given dirOption is false and isDirectory of fileStat return true', () => {
      const dirOption = false

      fileStat.isDirectory.returns(true)

      const result = utils.dirOptionChecker(dirOption, fileStat)

      expect(result).to.be.false
    })
  })

  describe('regexpOptionChecker tests', () => {
    const filePath = 'filePath'

    it('should call test of regexp with filePath and return result given valid regexpOption', () => {
      const regexpOption = /test/

      sandbox.stub(regexpOption, 'test')
        .returns('resultFromRegexpTest')

      const result = utils.regexpOptionChecker(regexpOption, filePath)

      expect(
        regexpOption.test
          .calledWithExactly(filePath)
      ).to.be.true
      expect(result).to.be.equal('resultFromRegexpTest')
    })

    it('should return true given not valid regexpOption', () => {
      const regexpOption = 'regexpOption'

      const result = utils.regexpOptionChecker(regexpOption, filePath)

      expect(result).to.be.true
    })
  })
})
