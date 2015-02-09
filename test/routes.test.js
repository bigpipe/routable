describe('Routes', function () {
  'use strict';

  var Route = require('../')
    , assume = require('assume');

  [
    { route: '/404', matches: '/404' }
  , { route: '/foo', matches: '/foo' }
  , { route: '/foo/bar', matches: '/foo/bar' }
  , { route: '/foo/:bar', matches: '/foo/bar' }
  , { route: '/foo/:bar?', matches: '/foo/bar' }
  , { route: '/foo/:bar?', matches: '/foo/' }
  , { route: '/foo/:bar?', matches: '/foo' }
  , { route: /^\/simpleregexp/, matches: '/simpleregexp' }
  , { route: /^\/foo\/(.*)/, matches: '/foo/complex' }
  , { route: '/^\\/(?<named>[\\d\\.]+)\\/foo/', matches: '/1.0.0/foo' }
  ].forEach(function generate(test) {
    it(test.route +' matches against '+ test.matches, function () {
      var r = new Route(test.route);

      assume(r.test(test.matches)).to.equal(true);
    });
  });
});
