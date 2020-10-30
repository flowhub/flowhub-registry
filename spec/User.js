const chai = require('chai');
const uuid = require('uuid');
const registry = require('../index');
const mocks = require('./helpers/mocks');

let secret = 'hello world';

// options.host = 'http://localhost:5000'

describe('User\'s Runtime Registry', () => {
  const options = {};
  let inputData = null;
  secret = 'hello world';
  let user = null;
  let rt = null;
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

  it('should not contain the runtime before registering', (done) => {
    const listRuntimes = mocks.listRuntimes();
    registry.list(user.token, options, (err, runtimes) => {
      if (err) {
        done(err);
        return;
      }
      chai.expect(runtimes).to.eql([]);
      chai.expect(listRuntimes.isDone()).to.equal(true);
      done();
    });
  });
  it('should contain the runtime after registering', (done) => {
    const updateRuntime = mocks.updateRuntime(inputData.id);
    const listRuntimes = mocks.listRuntimes();
    rt.register((err) => {
      if (err) {
        done(err);
        return;
      }
      registry.list(user.token, options, (listErr, runtimes) => {
        if (listErr) {
          done(listErr);
          return;
        }
        chai.expect(runtimes).to.be.an('array');
        let found = false;
        runtimes.forEach((runtime) => {
          if (runtime.runtime.id === inputData.id) {
            found = true;
          }
        });
        chai.expect(found).to.equal(true);
        chai.expect(updateRuntime.isDone()).to.equal(true);
        chai.expect(listRuntimes.isDone()).to.equal(true);
        done();
      });
    });
  });
  it('should not contain the runtime after deletion', (done) => {
    const deleteRuntime = mocks.deleteRuntime(inputData.id);
    const listRuntimes = mocks.listRuntimes();
    rt.del(user.token, (err) => {
      if (err) {
        done(err);
        return;
      }
      registry.list(user.token, options, (listErr, runtimes) => {
        if (listErr) {
          done(listErr);
          return;
        }
        chai.expect(runtimes).to.eql([]);
        chai.expect(deleteRuntime.isDone()).to.equal(true);
        chai.expect(listRuntimes.isDone()).to.equal(true);
        done();
      });
    });
  });
});
