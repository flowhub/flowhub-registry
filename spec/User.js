/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const registry = require('../index');
const chai = require('chai');
const uuid = require('uuid');
const mocks = require('./helpers/mocks');

const id = require('uuid').v4();
let secret = 'hello world';

// options.host = 'http://localhost:5000'

describe('User\'s Runtime Registry', function() {
  const options = {};
  let inputData = null;
  secret = 'hello world';
  let user = null;
  let rt = null;
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

  it('should not contain the runtime before registering', function(done) {
    const listRuntimes = mocks.listRuntimes();
    return registry.list(user.token, options, function(err, runtimes) {
      if (err) { return done(err); }
      chai.expect(runtimes).to.eql([]);
      chai.expect(listRuntimes.isDone()).to.equal(true);
      return done();
    });
  });
  it('should contain the runtime after registering', function(done) {
    const updateRuntime = mocks.updateRuntime(inputData.id);
    const listRuntimes = mocks.listRuntimes();
    return rt.register(function(err, ok) {
      if (err) { return done(err); }
      return registry.list(user.token, options, function(err, runtimes) {
        if (err) { return done(err); }
        chai.expect(runtimes).to.be.an('array');
        let found = false;
        runtimes.forEach(function(runtime) {
          if (runtime.runtime.id === inputData.id) { return found = true; }
        });
        chai.expect(found).to.be.true;
        chai.expect(updateRuntime.isDone()).to.equal(true);
        chai.expect(listRuntimes.isDone()).to.equal(true);
        return done();
      });
    });
  });
  return it('should not contain the runtime after deletion', function(done) {
    const deleteRuntime = mocks.deleteRuntime(inputData.id);
    const listRuntimes = mocks.listRuntimes();
    return rt.del(user.token, function(err, ok) {
      if (err) { return done(err); }
      return registry.list(user.token, options, function(err, runtimes) {
        if (err) { return done(err); }
        chai.expect(runtimes).to.eql([]);
        chai.expect(deleteRuntime.isDone()).to.equal(true);
        chai.expect(listRuntimes.isDone()).to.equal(true);
        return done();
      });
    });
  });
});
