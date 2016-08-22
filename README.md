
import-all-from
===============

A util helps importing all utils from given directory path

## Installation
``` sh
$ npm install import-all-from --save
```

## Usage
``` js
const importAllFrom = require('import-all-from')

// return an array containing all modules right under given directory
const utils = importAllFrom('/system/absolute/path/to/dest/dir')

utils.forEach(() => {
  // do something ...
})

// or

for (const util of utils) {
  // do something ...
}

```
**NOTE:** Directory path should be an absolute path from system root. For node.js, you can use `___dirname` to get absolute path of the directory where current file is located in.

``` js
// assume __dirname here refers to '/system/absolute/path/to'
const modules = importAllFrom(__dirname + '/dest/dir')
```


## Options
``` js
importAllFrom(path, {
  file: {Boolean}, // false for not importing file modules [default: true]
  dir: {Boolean}, // false for not importing directory modules [default: true]
  regexp: {RegExp} // importing file/directory modules whose name matching regexp [default: undefined]
})
```

## Examples

### (1) Writing Tests

This util makes an easy way to manage structure of test files, you can thus handle each function test with separate file.

``` js
describe('unit tests', () => {
  // import all tests under specific directory
  importAllFrom(__dirname + '/unit-tests')
})

/* unit-tests/unit-test1.js */
describe('unit-test1', ...)

/* unit-tests/unit-test2.js */
describe('unit-test2', ...)

// ...
```

### (2) Handlers / Checkers

Perhaps you might have some state handlers / checkers which have same return data format, for better management, you can separate each condition with different modules with this util.

``` js
let state

const checkers = importAllFrom(__dirname + '/checkers')

for (const checker of checkers) {
  state = checker(...arg)

  if (state) { // or satisfied specific condition
    // do something ...
  }
}
```

## Tests
* unit-test & integration-test
``` sh
$ npm test
```

* unit-test only
``` sh
$ npm run test-unit
```

* integration-test only
``` sh
$ npm run test-integration
```

## License
MIT
