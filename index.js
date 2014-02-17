var superagent = require('superagent');

exports.Runtime = function (runtime, options) {
  if (typeof runtime !== 'object') {
    throw new Error('Runtime options expected');
  }
  if (!runtime.id) {
    throw new Error('Runtime requires an UUID');
  }

  this.runtime = runtime;

  this.options = {
    host: 'https://flowhub-api.herokuapp.com'
  };

  if (options) {
    Object.keys(options).forEach(function (name) {
      this.options[name] = options[name];
    }.bind(this));
  }
};

exports.Runtime.prototype.register = function (callback) {
  if (!this.runtime.user) {
    throw new Error('Runtime registration requires a user UUID');
  }
  if (!this.runtime.address) {
    throw new Error('Runtime registration requires an address URL');
  }
  if (!this.runtime.protocol) {
    throw new Error('Runtime registration requires a protocol');
  }
  if (!this.runtime.type) {
    throw new Error('Runtime registration requires a type');
  }
  superagent.put(this.options.host + '/runtimes/' + this.runtime.id)
  .send(this.runtime)
  .end(callback);
};

exports.Runtime.prototype.ping = function () {
  superagent.post(this.options.host + '/runtimes/' + this.runtime.id)
  .send({})
  .end(function (err, res) {});
};

exports.Runtime.prototype.get = function (token, callback) {
  if (!token) {
    throw new Error('API token required for deletion');
  }
  superagent.get(this.options.host + '/runtimes/' + this.runtime.id)
  .end(function (err, res) {
    if (err) {
      callback(err);
      return;
    }
    Object.keys(res).forEach(function (name) {
      this.runtime[name] = res[name];
    }.bind(this));
    callback(null, this.runtime);
  }.bind(this));
};


exports.Runtime.prototype.del = function (token, callback) {
  if (!token) {
    throw new Error('API token required for deletion');
  }
  superagent.del(this.options.host + '/runtimes/' + this.runtime.id)
  .end(callback);
};
