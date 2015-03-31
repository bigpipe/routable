'use strict';

var xRegExp = require('xregexp').XRegExp
  , url = require('url');

/**
 * Route is a simple representation of a HTTP route. It can be used to simply
 * check if a given URL matches a certain route.
 *
 * @constructor
 * @param {String|RegExp} url URL to match against.
 * @api private
 */
var Route = module.exports = function Route(url) {
  if (!(this instanceof Route)) return new Route(url);
  if (!url) throw new Error('Missing url argument');

  this.flags = '';      // RegExp flags.
  this._url = '';       // Backup of the real URL.
  this.params = [];     // Param names from the URL
  this.parsers = {};    // Param parsers.
  this.pattern = '';    // RegExp body.
  this._compiled = 0;   // Compiled version of xRegExp.

  // Set the URL of the route, it will be automatically parsed.
  this.url = url;
};

Object.defineProperty(Route.prototype, 'url', {
    enumerable: false

    /**
     * Returns the compiled version of a URL.
     *
     * @returns {String}
     * @api private
     */
  , get: function get() {
      return this._url.toString();
    }

    /**
     * Parse the URL.
     *
     * @param {Mixed} uri The URI that needs to be parsed.
     * @api private
     */
  , set: function set(uri) {
      var xregexpre = /\/\^(.*)+\/([sxngimy]+)?$/g
        , self = this
        , re;

      //
      // We're already a regular expression, no need to parse it further.
      //
      if (uri instanceof RegExp) {
        this._url = uri;
        this.pattern = uri.source;
        this.flags = '';

        if (uri.global) this.flags += 'g';
        if (uri.ignoreCase) this.flags += 'i';
        if (uri.multiline) this.flags += 'm';

        return this.compile();
      }

      //
      // Only strings and regular expressions are allowed.
      //
      if (typeof (uri) !== 'string') throw new TypeError('url must be a String');

      //
      // When we've received a string that starts with a `/^ .. /flags`, assume
      // that we've been given a valid xRegExp string.
      //
      if (re = xregexpre.exec(uri)) {
        this._url = uri;
        this.pattern = re[1];
        this.flags = re[2];

        return this.compile();
      }

      this._url = url.parse(uri).path;
      this.pattern = '^';
      this.flags = 'x';
      this.params = [];

      this._url.split('/').forEach(function forEach(fragment) {

        if (!fragment.length) return;

        var named = fragment.charAt(0) === ':'
          , optional = fragment.charAt(fragment.length - 1) === '?';

        self.pattern += optional ? '\\/*' : '\\/+';

        if (named) {
          //
          // Previously was gratuitous, but better to just be standard
          // self.pattern += '([a-zA-Z0-9-_~%!;@=+\\$\\*\\.]+)';
          //
          // See RFC3986, or this handy table:
          // http://en.wikipedia.org/wiki/Percent-encoding#Types_of_URI_characters
          //
          self.pattern += '([a-zA-Z0-9-_~\\.%]+)';
          self.params.push(fragment.slice(1, optional ? -1 : undefined));
        } else {
          self.pattern += fragment;
        }

        if (optional) self.pattern += '?';
      });

      if (this.pattern === '^') this.pattern += '\\/';
      this.pattern += '$';

      return this.compile();
    }
});

/**
 * Compile our dis-assembled source to a new xRegExp instance.
 *
 * @api private
 */
Route.prototype.compile = function compile() {
  this.compiled = xRegExp(this.pattern, this.flags);

  return this;
};

/**
 * Check if URL matches the route.
 *
 * @param {String} uri The URI we want to test against this route.
 * @returns {Boolean}
 * @api public
 */
Route.prototype.test = function test(uri) {
  return this.compiled.test(uri);
};

/**
 * Whether or not the route matches the given request's URL.
 *
 * @param {Object} req an http request object.
 * @return {Object} parameters of the configured route -> URL.
 * @throws {TypeError} on input error.
 * @api public
 */
Route.prototype.exec = function exec(uri) {
  var re = xRegExp(this.pattern, this.flags)
    , params = Object.create(null)
    , result = re.xexec(uri)
    , i = 0;

  if (!result) return undefined;

  //
  // Extract the parameters from the URL.
  //
  if (this.params && this.params.length) {
    this.params.forEach(function parseParams(p) {
      if (++i < result.length) params[p] = result[i] ? decodeURIComponent(result[i]) : null;
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

  //
  // Iterate over the parsers so they can transform the results if needed.
  //
  for (var param in params) {
    if (param in this.parsers) {
      params[param] = this.parsers[param](params[param], uri, param);
    }
  }

  return params;
};

/**
 * Add a custom param parser for when we execute the route on a given URL.
 *
 * @param {String} name name of the param
 * @param {Function} fn parser of the param
 * @api public
 */
Route.prototype.param = function param(name, fn) {
  this.parsers[name] = fn;

  return this;
};

/**
 * String representation.
 *
 * @return {String} in the form indicated above.
 * @api private
 */
Route.prototype.toString = function toString() {
  var str = this.url.toString()
    , opts = [];

  if (this.version) opts.push('version=' + this.version);
  if (opts.length) str += ' (' + opts.join(', ') + ')';

  return str;
};

Route.extend = require('extendible');
