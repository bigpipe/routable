# Routable

[![Build Status](https://travis-ci.org/3rd-Eden/routable.png)](https://travis-ci.org/3rd-Eden/routable)

Routable is a lightweight route parser for Node.js. It's primary focus is to
parse routes, and that's it. It's modeled against the RegExp instance so it's
usage feels really natural to developers.

### Installation

Installation is done through `npm`:

```
npm instal --save routable
```

### Getting Started

Include module in your application:

```js
var Route = require('routable');
```

Create a new `Route` instance with an URL we need to match against:

```js
var route = new Route('/foo');
```

To learn more about the API, please visit the API documentation:

- https://github.com/3rd-Eden/routable/blob/master/docs/README.md

## License

MIT
