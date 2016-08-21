import-all-from
===============

A util helps importing all modules from given directory path

## Installation
``` sh
$ npm install import-all-from --save
```

## Usage
``` js
const importAllFrom = require('import-all-from')

// return an array containing all modules right below of given directory
const modules = importAllFrom('./path/starting/from/root/to/dest/dir')

modules.forEach(() => {
  // do something ...
})

```
**NOTE:** Directory path should be a relative path starting from root

## Options
``` js
importAllFrom(pathFromRoot, {
  file: {Boolean}, // false for not importing file modules [default: true]
  dir: {Boolean}, // false for not importing directory modules [default: true]
  regexp: {RegExp} // importing file/directory modules whose name matching regexp [default: undefined]
})
```

## Tests

``` sh
$ npm test
```

## License
MIT
