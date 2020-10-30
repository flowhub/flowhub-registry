/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const registry = require('../index');
const chai = require('chai');
const uuid = require('uuid');
const mocks = require('./helpers/mocks');

describe('Runtime', function() {
  const options = {};
  let inputData = null;
  const secret = 'hello world';
  let user = null;
  let rt = null;
  let firstseen = null;
  before(function() {
    user = mocks.setupUser(uuid.v4());
    inputData = {
      id: uuid.v4(),
      label: 'Test runtime',
      user: user.id,
      protocol: 'websocket',
      address: 'ws://localhost:3569',
      type: 'test',
      secret
    };
    return rt = new registry.Runtime(inputData, options);
  });
  after(() => mocks.cleanUp());

  it('should be possible to register', function(done) {
    const updateRuntime = mocks.updateRuntime(inputData.id);
    return rt.register(function(err, ok) {
      if (err) { return done(err); }
      chai.expect(updateRuntime.isDone()).to.equal(true);
      return done();
    });
  });
  it('should be possible to fetch', function(done) {
    const getRuntime = mocks.getRuntime(inputData.id);
    return rt.get(user.token, function(err, ok) {
      if (err) { return done(err); }
      for (let name in inputData) {
        const value = inputData[name];
        chai.expect(rt.runtime[name]).to.equal(value);
      }
      chai.expect(rt.runtime.registered.getTime()).to.be.above(0);
      chai.expect(rt.runtime.seen.getTime()).to.be.above(0);
      firstseen = rt.runtime.seen;
      chai.expect(getRuntime.isDone()).to.equal(true);
      return done();
    });
  });
  it('when pinged the "seen" value should change', function(done) {
    const pingRuntime = mocks.pingRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);

    // First we ping
    return rt.ping(function(err) {
      if (err) { return done(err); }

      // Then we fetch
      return rt.get(user.token, function(err, ok) {
        if (err) { return done(err); }
        chai.expect(rt.runtime.seen.getTime()).to.be.above(firstseen.getTime());
        chai.expect(pingRuntime.isDone()).to.equal(true);
        chai.expect(getRuntime.isDone()).to.equal(true);
        return done();
      });
    });
  });
  it('should be possible to update', function(done) {
    const newAddress = 'ws://example.net:3569';
    const updateRuntime = mocks.updateRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);
    rt.runtime.address = newAddress;
    return rt.register(function(err) {
      if (err) { return done(err); }
      chai.expect(updateRuntime.isDone()).to.equal(true);
      return rt.get(user.token, function(err) {
        if (err) { return done(err); }
        chai.expect(rt.runtime.address).to.equal(newAddress);
        chai.expect(getRuntime.isDone()).to.equal(true);
        return done();
      });
    });
  });
  it('should be possible to delete', function(done) {
    const deleteRuntime = mocks.deleteRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);
    return rt.del(user.token, function(err, ok) {
      if (err) { return done(err); }
      // Verify that it is gone
      return rt.get(user.token, function(err, ok) {
        chai.expect(err).to.be.an('error');
        chai.expect(deleteRuntime.isDone()).to.equal(true);
        chai.expect(getRuntime.isDone()).to.equal(true);
        return done();
      });
    });
  });
  return it('should be possible to call delete on removed runtime', function(done) {
    const deleteRuntime = mocks.deleteRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);
    return rt.del(user.token, function(err, ok) {
      if (err) { return done(err); }
      return done();
    });
  });
});
