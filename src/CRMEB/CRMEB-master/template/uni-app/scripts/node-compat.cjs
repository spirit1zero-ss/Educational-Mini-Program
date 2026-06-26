const util = require('util');

if (typeof util.isRegExp !== 'function') {
  util.isRegExp = function isRegExp(value) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
  };
}
