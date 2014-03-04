var superagent = require('superagent');
var defaults = {
  host: 'https://api.flowhub.io'
};

exports.Runtime = function (runtime, options) {
  if (typeof runtime !== 'object') {
    throw new Error('Runtime options expected');
  }
  if (!runtime.id) {
    throw new Error('Runtime requires an UUID');
  }

  this.runtime = runtime;
  this.options = {};
  Object.keys(defaults).forEach(function (name) {
    this.options[name] = defaults[name];
  }.bind(this));

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

exports.Runtime.prototype.ping = function (callback) {
  superagent.post(this.options.host + '/runtimes/' + this.runtime.id)
  .send({})
  .end(function (err, res) {
    if (callback) {
      callback(err);
    }
  });
};

exports.Runtime.prototype.get = function (token, callback) {
  if (!token) {
    throw new Error('API token required for fetching');
  }
  superagent.get(this.options.host + '/runtimes/' + this.runtime.id)
  .set('Authorization', 'Bearer ' + token)
  .end(function (err, res) {
    if (err) {
      callback(err);
      return;
    }
    Object.keys(res.body).forEach(function (name) {
      if (name == 'seen' || name == 'registered') {
        this.runtime[name] = new Date(res.body[name]);
        return;
      }
      this.runtime[name] = res.body[name];
    }.bind(this));
    callback(null, this.runtime);
  }.bind(this));
};


exports.Runtime.prototype.del = function (token, callback) {
  if (!token) {
    throw new Error('API token required for deletion');
  }
  superagent.del(this.options.host + '/runtimes/' + this.runtime.id)
  .set('Authorization', 'Bearer ' + token)
  .end(callback);
};

exports.list = function (token, options, callback) {
  if (!token) {
    throw new Error('API token required for fetching');
  }
  if (!callback) {
    callback = options;
    options = {};
  }

  Object.keys(defaults).forEach(function (name) {
    if (options[name]) {
      return;
    }
    options[name] = defaults[name];
  }.bind(this));

  superagent.get(options.host + '/runtimes/')
  .set('Authorization', 'Bearer ' + token)
  .end(function (err, res) {
    if (err) {
      callback(err);
      return;
    }
    var results = [];
    res.body.forEach(function (result) {
      result.registered = new Date(result.registered);
      result.seen = new Date(result.seen);
      results.push(new exports.Runtime(result, options));
    });
    callback(null, results);
  });
};
