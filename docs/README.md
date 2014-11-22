# API documentation


### routable.Route(url _String|RegExp_)
<p>Route is a simple representation of a HTTP route. It can be used to simply<br />check if a given URL matches a certain route.</p>


#### Arguments

- **url** _String, RegExp_ URL to match against.



#### Implementation
```js
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
```
---------------------------------------

### routable.
<p>Returns the compiled version of a URL.</p>



#### Implementation
```js
, get: function get() {
      return this._url.toString();
    }
```
---------------------------------------

### routable.(uri _Mixed_)
<p>Parse the URL.</p>


#### Arguments

- **uri** _Mixed_ The URI that needs to be parsed.



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

        self.pattern += optional ? '\\
```
---------------------------------------

### routable.compile
<p>: &#39;\/+&#39;;</p><pre><code>    if (named) {
      //
      // Previously was gratuitous, but better to just be standard
      // self.pattern += &#39;([a-zA-Z0-9-_~%!;@=+\\$\\*\\.]+)&#39;;
      //
      // See RFC3986, or this handy table:
      // http://en.wikipedia.org/wiki/Percent-encoding#Types_of_URI_characters
      //
      self.pattern += &#39;([a-zA-Z0-9-_~\\.%]+)&#39;;
      self.params.push(fragment.slice(1, optional ? -1 : undefined));
    } else {
      self.pattern += fragment;
    }

    if (optional) self.pattern += &#39;?&#39;;
  });

  if (this.pattern === &#39;^&#39;) this.pattern += &#39;\\/&#39;;
  this.pattern += &#39;$&#39;;

  return this.compile();
}
</code></pre><p>});</p><p>/**<br />Compile our dis-assembled source to a new xRegExp instance.</p>



#### Implementation
```js
Route.prototype.compile = function compile() {
  this.compiled = xRegExp(this.pattern, this.flags);

  return this;
};
```
---------------------------------------

### routable.test(uri _String_)
<p>Check if URL matches the route.</p>


#### Arguments

- **uri** _String_ The URI we want to test against this route.



#### Implementation
```js
Route.prototype.test = function test(uri) {
  return this.compiled.test(uri);
};
```
---------------------------------------

### routable.exec(req _Object_)
<p>Whether or not the route matches the given request&#39;s URL.</p>


#### Arguments

- **req** _Object_ an http request object.



#### Implementation
```js
Route.prototype.exec = function exec(uri) {
  var re = xRegExp(this.pattern, this.flags)
    , params = Object.create(null)
    , result = re.exec(uri)
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
```
---------------------------------------

### routable.param(name _String_, fn _Function_)
<p>Add a custom param parser for when we execute the route on a given URL.</p>


#### Arguments

- **name** _String_ name of the param

- **fn** _Function_ parser of the param



#### Implementation
```js
Route.prototype.param = function param(name, fn) {
  this.parsers[name] = fn;

  return this;
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

Route.extend = require('extendible');
```
---------------------------------------


