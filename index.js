var superagent = require('superagent');
var defaults = {
  host: 'https://api.flowhub.io'
};

Object.defineProperty(exports, "PING_INTERVAL", {
    value:      10 * 60 * 1000,
    enumerable: true
  });

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

exports.Runtime.prototype.register = function (token, callback) {
  if (typeof token === 'function') {
    callback = token;
    token = null;
  }
  if (!this.runtime.user) {
    callback (new Error('Runtime registration requires a user UUID'));
    return;
  }
  if (!this.runtime.address) {
    callback (new Error('Runtime registration requires an address URL'));
    return;
  }
  if (!this.runtime.protocol) {
    callback (new Error('Runtime registration requires a protocol'));
    return;
  }
  if (!this.runtime.type) {
    callback (new Error('Runtime registration requires a type'));
    return;
  }
  if (token) {
    superagent.put(this.options.host + '/runtimes/' + this.runtime.id)
    .set('Authorization', 'Bearer ' + token)
    .send(this.runtime)
    .end(callback);
    return;
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
    return callback(new Error('API token required for fetching'));
  }
  superagent.get(this.options.host + '/runtimes/' + this.runtime.id)
  .set('Authorization', 'Bearer ' + token)
  .end(function (err, res) {
    if (err) {
      callback(err);
      return;
    }
    if (res.status !== 200) {
      callback(new Error('Request returned ' + res.status));
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
    return callback(new Error('API token required for deletion'));
  }
  superagent.del(this.options.host + '/runtimes/' + this.runtime.id)
  .set('Authorization', 'Bearer ' + token)
  .end(function (err, res) {
    if (err && err.status === 404) {
      // If the runtime is already gone, that is fine too
      callback();
      return;
    }
    callback(err, res);
  });
};

exports.list = function (token, options, callback) {
  if (!token) {
    return callback(new Error('API token required for fetching'));
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
    if (res.status !== 200) {
      callback(new Error('Request returned ' + res.status));
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
