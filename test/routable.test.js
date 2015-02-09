describe('Route', function () {
  'use strict';

  var Route = require('../')
    , assume = require('assume');

  it('should be exported as function', function () {
    assume(Route).to.be.a('function');
  });

  it('should throw if no url argument is given', function () {
    assume(Route).to.throw('Missing url argument');
  });

  describe('#url', function () {
    it('should parse the given url to patterns so they can be matched', function () {
      var r = new Route('/foo/bar');

      assume(r.pattern).to.be.a('string');
      assume(r.pattern).to.include('foo');
    });

    it('should update the pattern when a new url has been set', function () {
      var r = new Route('/foo/bar');

      assume(r.pattern).to.include('foo');
      assume(r.pattern).to.not.include('waffles');

      r.url = '/waffles';

      assume(r.pattern).to.include('waffles');
      assume(r.pattern).to.not.include('foo');
    });

    it('should return the url that we had set', function () {
      var r = new Route('/foo');

      assume(r.url).to.equal('/foo');
    });

    it('should accept regexps as urls', function () {
      var r = new Route(/\/foo\/bar/);

      assume(r.url).to.be.a('string');
    });

    it('should transform "/^adfasdfa/adfasf/gm" to a XRegExp', function () {
       var r = new Route('/^\\/adfasdfa\\/adfasf/gm');

       assume(r.url).to.be.a('string');
       assume(r.test('/adfasdfa/adfasf')).to.equal(true);
    });

    it('should accept named parameters', function () {
      var r = new Route('/foo/:bar');
      var value = r.exec('/foo/banana');
      assume(value.bar).to.equal('banana');

      var r = new Route('/foo/:bar/foz/:baz');
      var value = r.exec('/foo/banana/foz/potato');
      assume(value.bar).to.equal('banana');
      assume(value.baz).to.equal('potato');
    });
  });

  describe('#test', function () {
    it('should test against urls for matches', function () {
      var r = new Route('/foo');

      assume(r.test('/foo')).to.equal(true);
      assume(r.test('/foo/bar')).to.equal(false);

      r = new Route(/\/foo\/bar/);

      assume(r.test('/foo')).to.equal(false);
      assume(r.test('/foo/bar')).to.equal(true);
    });

    it('should accept optional parameters', function () {
      var r = new Route('/foo/:bar?');

      var value = r.exec('/foo/apple');

      assume(r.test('/foo/apple')).to.equal(true);
      assume(r.exec('/foo/apple').bar).to.equal('apple');

      assume(r.test('/foo')).to.equal(true);
      assume(r.exec('/foo').bar).to.equal(null);

      assume(r.test('/foo/')).to.equal(true);
      assume(r.exec('/foo/').bar).to.equal(null);
    });
  });

  describe('#param', function () {
    it('should transform a given param', function () {
      var r = new Route('/foo/:bar');

      r.param('bar', function (value, uri, param) {
        assume(value).to.equal('banana');
        assume(uri).to.equal('/foo/banana');
        assume(param).to.equal('bar');

        return 'foo';
      });

      var value = r.exec('/foo/banana');

      assume(value.bar).to.equal('foo');
    });
  });
});
