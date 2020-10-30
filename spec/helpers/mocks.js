/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const nock = require('nock');
const uuid = require('uuid');

const users = {};
let runtimes = {};

exports.setupUser = function(id) {
  users[id] = {
    id,
    token: uuid.v4()
  };
  return users[id];
};

exports.authenticate = function(headers) {
  if (!headers.authorization) {
    return null;
  }
  if (headers.authorization.indexOf('Bearer') === -1) {
    return null;
  }
  const token = headers.authorization.substr(7);
  for (let id in users) {
    const user = users[id];
    if (user.token === token) { return user; }
  }
  return null;
};

exports.updateRuntime = id => nock('https://api.flowhub.io')
.put(`/runtimes/${id}`)
.reply(function(path, requestBody, done) {
  const body = typeof requestBody === 'object' ? requestBody : JSON.parse(requestBody);
  if (runtimes[id] && (body.secret !== runtimes[id].secret)) {
    done(null, [403, 'Unauthorized to modify runtime']);
    return;
  }
  if (!runtimes[id]) { runtimes[id] = {}; }
  for (let key in body) {
    const val = body[key];
    runtimes[id][key] = val;
  }
  const now = new Date;
  runtimes[id].seen = now;
  if (!runtimes[id].registered) { runtimes[id].registered = now; }
  done(null, [200, runtimes[id]]);
});

exports.pingRuntime = id => nock('https://api.flowhub.io')
.post(`/runtimes/${id}`)
.reply(function(path, requestBody, done) {
  if (!runtimes[id]) {
    done(null, [404, 'Runtime not found']);
    return;
  }
  runtimes[id].seen = new Date;
  done(null, [200]);
});

exports.listRuntimes = () => nock('https://api.flowhub.io')
.get("/runtimes/")
.reply(function(path, requestBody, done) {
  const user = exports.authenticate(this.req.headers);
  if (!user) {
    done(null, [401, 'Authentication required']);
    return;
  }
  const userRuntimes = [];
  for (let id in runtimes) {
    const runtime = runtimes[id];
    if (runtime.user !== user.id) { continue; }
    userRuntimes.push(runtime);
  }
  done(null, [200, userRuntimes]);
});

exports.getRuntime = id => nock('https://api.flowhub.io')
.get(`/runtimes/${id}`)
.reply(function(path, requestBody, done) {
  const user = exports.authenticate(this.req.headers);
  if (!user) {
    done(null, [401, 'Authentication required']);
    return;
  }
  if (!runtimes[id]) {
    done(null, [404, 'Runtime not found']);
    return;
  }
  if (runtimes[id].user !== user.id) {
    done(null, [403, 'Unauthorized']);
    return;
  }
  done(null, [200, runtimes[id]]);
});

exports.deleteRuntime = id => nock('https://api.flowhub.io')
.delete(`/runtimes/${id}`)
.reply(function(path, requestBody, done) {
  const user = exports.authenticate(this.req.headers);
  if (!user) {
    done(null, [401, 'Authentication required']);
    return;
  }
  if (!runtimes[id]) {
    done(null, [404, 'Runtime not found']);
    return;
  }
  if (runtimes[id].user !== user.id) {
    done(null, [403, 'Unauthorized']);
    return;
  }
  delete runtimes[id];
  done(null, [204]);
});

exports.cleanUp = function() {
  runtimes = {};
  return nock.cleanAll();
};
