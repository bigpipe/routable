describe('Route', function () {
  'use strict';

  // set up chai, our assertation library
  var chai = require('chai')
    , expect = chai.expect;

  chai.Assertion.includeStack = true;

  var Route = require('../');

  it('should be exported as function', function () {
    expect(Route).to.be.a('function');
  });

  it('should throw if no url argument is given', function () {
    expect(Route).to.throw('Missing url argument');
  });

  describe('#url', function () {
    it('should parse the given url to patterns so they can be matched', function () {
      var r = new Route('/foo/bar');

      expect(r.pattern).to.be.a('string');
      expect(r.pattern).to.include('foo');
    });

    it('should update the pattern when a new url has been set', function () {
      var r = new Route('/foo/bar');

      expect(r.pattern).to.include('foo');
      expect(r.pattern).to.not.include('waffles');

      r.url = '/waffles';

      expect(r.pattern).to.include('waffles');
      expect(r.pattern).to.not.include('foo');
    });

    it('should return the url that we had set', function () {
      var r = new Route('/foo');

      expect(r.url).to.equal('/foo');
    });

    it('should accept regexps as urls', function () {
      var r = new Route(/\/foo\/bar/);

      expect(r.url).to.be.a('string');
    });

    it('should transform "/^adfasdfa/adfasf/gm" to a XRegExp', function () {
       var r = new Route('/^\\/adfasdfa\\/adfasf/gm');

       expect(r.url).to.be.a('string');
       expect(r.test('/adfasdfa/adfasf')).to.equal(true);
    });

    it('should accept named parameters');
  });

  describe('#test', function () {
    it('should test against urls for matches', function () {
      var r = new Route('/foo');

      expect(r.test('/foo')).to.equal(true);
      expect(r.test('/foo/bar')).to.equal(false);

      r = new Route(/\/foo\/bar/);

      expect(r.test('/foo')).to.equal(false);
      expect(r.test('/foo/bar')).to.equal(true);
    });

    it('should accept optional parameters');
  });

  describe('#param', function () {
    it('should transform a given param', function () {
      var r = new Route('/foo/:bar');

      r.param('bar', function (value, uri, param) {
        expect(value).to.equal('banana');
        expect(uri).to.equal('/foo/banana');
        expect(param).to.equal('bar');

        return 'foo';
      });

      var value = r.exec('/foo/banana');

      expect(value.bar).to.equal('foo');
    });
  });
});
