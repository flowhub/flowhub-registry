const chai = require('chai');
const uuid = require('uuid');
const registry = require('../index');
const mocks = require('./helpers/mocks');

describe('Runtime', () => {
  const options = {};
  let inputData = null;
  const secret = 'hello world';
  let user = null;
  let rt = null;
  let firstseen = null;
  before(() => {
    user = mocks.setupUser(uuid.v4());
    inputData = {
      id: uuid.v4(),
      label: 'Test runtime',
      user: user.id,
      protocol: 'websocket',
      address: 'ws://localhost:3569',
      type: 'test',
      secret,
    };
    rt = new registry.Runtime(inputData, options);
  });
  after(() => mocks.cleanUp());

  it('should be possible to register', (done) => {
    const updateRuntime = mocks.updateRuntime(inputData.id);
    rt.register((err) => {
      if (err) {
        done(err);
        return;
      }
      chai.expect(updateRuntime.isDone()).to.equal(true);
      done();
    });
  });
  it('should be possible to fetch', (done) => {
    const getRuntime = mocks.getRuntime(inputData.id);
    rt.get(user.token, (err) => {
      if (err) {
        done(err);
        return;
      }
      Object.keys(inputData).forEach((name) => {
        const value = inputData[name];
        chai.expect(rt.runtime[name]).to.equal(value);
      });
      chai.expect(rt.runtime.registered.getTime()).to.be.above(0);
      chai.expect(rt.runtime.seen.getTime()).to.be.above(0);
      firstseen = rt.runtime.seen;
      chai.expect(getRuntime.isDone()).to.equal(true);
      done();
    });
  });
  it('when pinged the "seen" value should change', (done) => {
    const pingRuntime = mocks.pingRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);

    // First we ping
    rt.ping((err) => {
      if (err) {
        done(err);
        return;
      }

      // Then we fetch
      rt.get(user.token, (getErr) => {
        if (getErr) {
          done(getErr);
          return;
        }
        chai.expect(rt.runtime.seen.getTime()).to.be.above(firstseen.getTime());
        chai.expect(pingRuntime.isDone()).to.equal(true);
        chai.expect(getRuntime.isDone()).to.equal(true);
        done();
      });
    });
  });
  it('should be possible to update', (done) => {
    const newAddress = 'ws://example.net:3569';
    const updateRuntime = mocks.updateRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);
    rt.runtime.address = newAddress;
    rt.register((err) => {
      if (err) {
        done(err);
        return;
      }
      chai.expect(updateRuntime.isDone()).to.equal(true);
      rt.get(user.token, (getErr) => {
        if (getErr) {
          done(getErr);
          return;
        }
        chai.expect(rt.runtime.address).to.equal(newAddress);
        chai.expect(getRuntime.isDone()).to.equal(true);
        done();
      });
    });
  });
  it('should be possible to delete', (done) => {
    const deleteRuntime = mocks.deleteRuntime(inputData.id);
    const getRuntime = mocks.getRuntime(inputData.id);
    rt.del(user.token, (err) => {
      if (err) {
        done(err);
        return;
      }
      // Verify that it is gone
      rt.get(user.token, (getErr) => {
        chai.expect(getErr).to.be.an('error');
        chai.expect(deleteRuntime.isDone()).to.equal(true);
        chai.expect(getRuntime.isDone()).to.equal(true);
        done();
      });
    });
  });
  it('should be possible to call delete on removed runtime', (done) => {
    mocks.deleteRuntime(inputData.id);
    mocks.getRuntime(inputData.id);
    rt.del(user.token, (err) => {
      if (err) {
        done(err);
        return;
      }
      done();
    });
  });
});
