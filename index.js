'use strict';

var url = require('url')
  , xRegExp = require('xregexp').XRegExp;

/**
 *
 * @constructor
 * @param {String|RegExp} url url to match against
 */
var Route = module.exports = function Route(url) {
  if (!url) throw new Error('Missing url argument');

  this.flags = '';      // RegExp flags.
  this._url = '';       // Backup of the real url.
  this.params = [];     // Param names from the url.
  this.parsers = {};    // Param parsers.
  this.pattern = '';    // RegExp body.

  // Set the url of the route, it will be automatically parsed.
  this.url = url;
};

Object.defineProperty(Route.prototype, 'url', {
    enumerable: false
  , get: function get() {
      return this._url.toString();
    }

  , set: function set(uri) {
      var self = this;

      if (uri instanceof RegExp) {
        this._url = uri;
        this.pattern = uri.source;
        this.flags = '';

        if (uri.global) this.flags += 'g';
        if (uri.ignoreCase) this.flags += 'i';
        if (uri.multiline) this.flags += 'm';

        return;
      }

      if (typeof (uri) !== 'string') throw new TypeError('url must be a String');

      this._url = url.parse(uri).pathname;
      this.pattern = '^';
      this.flags = 'x';
      this.params = [];

      this._url.split('/').forEach(function (fragment) {
        if (!fragment.length) return;

        self.pattern += '\\/+';

        var named = fragment.charAt(0) === ':'
          , optional = fragment.charAt(fragment.length - 1) === '?';

        if (named) {
          // Previously was gratuitous, but better to just be standard
          // self.pattern += '([a-zA-Z0-9-_~%!;@=+\\$\\*\\.]+)';
          //
          // See RFC3986, or this handy table:
          // http://en.wikipedia.org/wiki/Percent-encoding#Types_of_URI_characters
          self.pattern += '([a-zA-Z0-9-_~\\.%]+)';
          self.params.push(fragment.slice(1, optional ? -1 : undefined));
        } else {
          self.pattern += fragment;
        }

        if (optional) self.pattern += '\\?';
      });

      if (self.pattern === '^') self.pattern += '\\/';
      self.pattern += '$';
    }
});

/**
 * Check if url matches the route.
 *
 * @param {String} uri
 * @returns {Boolean}
 */
Route.prototype.test = function test(uri) {
  if (typeof uri === 'string') uri = url.parse(uri);
  return xRegExp(this.pattern, this.flags).test(url.pathname);
};

/**
 * Whether or not the route matches the given request's url.
 *
 * @param {Object} req an http request object.
 * @return {Object} parameters of the configured route -> url.
 * @throws {TypeError} on input error.
 */
Route.prototype.exec = function exec(uri) {
  if (typeof uri === 'string') uri = url.parse(uri);

  var re = xRegExp(this.pattern, this.flags)
    , result = re.exec(uri.pathname);

  if (!result) return false;

  var params = {}
    , i = 0;

  // Extract the parameters from the url.
  if (this.params && this.params.length) {
    this.params.forEach(function parseParams(p) {
      if (++i < result.length) params[p] = decodeURIComponent(result[i]);
    });
  } else if (this._url instanceof RegExp) {
    for (i = 0; i < result.length; i++) {
      if (i === 0) continue;

      params[(i - 1)] = result[i];
    }
  } else if (re.xregexp && re.xregexp.captureNames) {
    re.xregexp.captureNames.forEach(function each(key) {
      params[key] = result[key];
    });
  }

  return params;
};

/**
 * @TODO finish this method and param parsing.
 * @param {String} name name of the param
 * @param {Function} fn parser of the param
 */
Route.prototype.param = function param(name, fn) {
  (this.parsers[name] = this.parsers[name] || []).push(fn);
};

/**
 * String representation.
 *
 * @return {String} in the form indicated above.
 */
Route.prototype.toString = function toString() {
  var str = this.url.toString()
    , opts = [];

  if (this.version) opts.push('version=' + this.version);
  if (opts.length) str += ' (' + opts.join(', ') + ')';

  return str;
};

Route.extend = require('extendable');
