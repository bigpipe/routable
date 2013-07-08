# API documentation


### routable.Route(url _String|RegExp_)
<p>Route is a simple representation of a HTTP route. It can be used to simply<br />check if a given URL matches a certain route.</p>


#### Arguments

- **url** _String, RegExp_ Url to match against.



#### Implementation
```js
var Route = module.exports = function Route(url) {
  if (!url) throw new Error('Missing url argument');

  this.flags = '';      // RegExp flags.
  this._url = '';       // Backup of the real url.
  this.params = [];     // Param names from the url.
  this.parsers = {};    // Param parsers.
  this.pattern = '';    // RegExp body.
  this._compiled = 0;   // Compiled version of xRegExp;

  // Set the url of the route, it will be automatically parsed.
  this.url = url;
};

Object.defineProperty(Route.prototype, 'url', {
    enumerable: false
```
---------------------------------------

### routable.
<p>Returns the compiled version of a url.</p>



#### Implementation
```js
, get: function get() {
      return this._url.toString();
    }
```
---------------------------------------

### routable.(uri _Mixed_)
<p>Parse the url.</p>


#### Arguments

- **uri** _Mixed_ The uri that needs to be parsed.



#### Implementation
```js
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
      // When we've received a string that starts with a `/^ .. /flgs`, assume that we've
      // been given a valid xregexp string.
      //
      if (re = xregexpre.exec(uri)) {
        this._url = uri;
        this.pattern = re[1];
        this.flags = re[2];

        return this.compile();
      }

      this._url = url.parse(uri).pathname;
      this.pattern = '^';
      this.flags = 'x';
      this.params = [];

      this._url.split('/').forEach(function forEach(fragment) {
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

      if (this.pattern === '^') this.pattern += '\\/';
      this.pattern += '$';

      return this.compile();
    }
});
```
---------------------------------------

### routable.compile
<p>Compile our dis-assembled source to a new xRegExp instance.</p>



#### Implementation
```js
Route.prototype.compile = function compile() {
  this.compiled = xRegExp(this.pattern, this.flags);

  return this;
};
```
---------------------------------------

### routable.test(uri _String_)
<p>Check if url matches the route.</p>


#### Arguments

- **uri** _String_ The uri we want to test against this route.



#### Implementation
```js
Route.prototype.test = function test(uri, pathname) {
  return this.compiled.test(uri);
};
```
---------------------------------------

### routable.exec(req _Object_)
<p>Whether or not the route matches the given request's url.</p>


#### Arguments

- **req** _Object_ an http request object.



#### Implementation
```js
Route.prototype.exec = function exec(uri) {
  var re = xRegExp(this.pattern, this.flags)
    , result = re.exec(uri);

  if (!result) return {};

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
```
---------------------------------------

### routable.param(name _String_, fn _Function_)
<p>@TODO finish this method and param parsing.</p>


#### Arguments

- **name** _String_ name of the param

- **fn** _Function_ parser of the param



#### Implementation
```js
Route.prototype.param = function param(name, fn) {
  (this.parsers[name] = this.parsers[name] || []).push(fn);
};
```
---------------------------------------

### routable.toString
<p>String representation.</p>



#### Implementation
```js
Route.prototype.toString = function toString() {
  var str = this.url.toString()
    , opts = [];

  if (this.version) opts.push('version=' + this.version);
  if (opts.length) str += ' (' + opts.join(', ') + ')';

  return str;
};

Route.extend = require('extendable');
```
---------------------------------------


