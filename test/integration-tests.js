const expect = require('chai').expect
const pathUtil = require('path')

const importAllFrom = require('..')

describe('integration tests', () => {
  const lib2 = require('./test-libs/lib2')
  const lib3 = require('./test-libs/lib3')
  const lib4 = require('./test-libs/lib4-test')

  const path = pathUtil.join(__dirname, 'test-libs')

  it('should import all valid libs from given path (except lib1)', () => {
    const result = importAllFrom(path)

    expect(result).to.be.eql([lib2, lib3, lib4])
  })

  it('should import only file libs from given path given false dir option', () => {
    const result = importAllFrom(path, {
      dir: false
    })
    expect(result).to.be.eql([lib3, lib4])
  })

  it('should import only dir libs from given path given false file option', () => {
    const result = importAllFrom(path, {
      file: false
    })
    expect(result).to.be.eql([lib2])
  })

  it('should import only libs matches given valid regexp option', () => {
    const result = importAllFrom(path, {
      regexp: /-test[.\w]+$/
    })
    expect(result).to.be.eql([lib4])
  })

  it('should import nothing given false file and dir options', () => {
    const result = importAllFrom(path, {
      file: false,
      dir: false
    })
    expect(result).to.be.eql([])
  })
})
