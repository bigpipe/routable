# Routable

[![Build Status](https://travis-ci.org/bigpipe/routable.png)](https://travis-ci.org/bigpipe/routable)

Routable is a lightweight regular expression inspired HTTP route parser for
Node.js. It only has one goal and that is to match and parse URL's for
frameworks.

### Installation

The module is released in the `npm` registry as `routable`:

```
npm install --save routable
```

The `--save` automatically adds the routable module to your package.json.

### Getting started

All the examples in this getting started assume that you have included the
module in your code and exposed it as a `Routable` variable:

```js
'use strict';

var Routable = require('routable');
```

To create a new route simply construct a new `Routable` instance with an URL
pattern:

```js
var foo = new Routable('/foo');
```

There are different patterns that can be used for testing against URL's.
Routable supports testing against strings, Regular Expressions and even xRegExp
based expressions. See [patterns](#patterns) for more details.

Now that you've created your first `Routable` instance you can use it to test
against URL's. To see if a URL matches the your `Routable` instance you can use
the `Routable#test` method:

#### Routable.test(url)

Just like the `RegularExpression.test` method, it returns a boolean indicating
if the given string matches the expression or not. The same is true for
`Routable` but instead of testing a Regular Express you're testing your pattern.

```js
var foo = new Routable('/foo');

foo.test('/bar');   // false;
foo.test('/foo');   // true;
foo.test('/fooo');  // false;
```

While quickly testing an URL is useful sometimes you also want to parse out the
information from the URL. If you have a capturing or named Regular Expression or
string you can use the `routable#exec`

#### Routable.exec(url)

With normal `RegularExpression.exec` you can either `undefined` or an `Array`
with results as return value. With a `Routable` instance you still get
`undefined` when there isn't a match but instead of an array you receive an
`Object`.

```js
var foobar = new Routable('/foo/:bar');

var res = foobar.exec('/foo/foo');

console.log(res.bar); // 'foo'
```

### Patterns

- Regular Expressions `/\/foo/`.
- Capturing Regular Expressions `/\/(foo|bar)\/bar/`.
- Capturing strings `/foo/:bar/1/:baz`.
- Optional parameters `/foo/:bar?`.
- Plain strings `/foo/bar`

## License

MIT
