const superagent = require('superagent');

const defaults = {
  host: 'https://api.flowhub.io',
};

Object.defineProperty(exports, 'PING_INTERVAL', {
  value: 10 * 60 * 1000,
  enumerable: true,
});

class Runtime {
  constructor(runtime, options) {
    if (typeof runtime !== 'object') {
      throw new Error('Runtime options expected');
    }
    if (!runtime.id) {
      throw new Error('Runtime requires an UUID');
    }

    this.runtime = runtime;
    this.options = {};
    Object.keys(defaults).forEach((name) => {
      this.options[name] = defaults[name];
    });

    if (options) {
      Object.keys(options).forEach((name) => {
        this.options[name] = options[name];
      });
    }
  }

  register(t, c) {
    let token = t;
    let callback = c;
    if (typeof token === 'function') {
      callback = t;
      token = null;
    }
    if (!this.runtime.user) {
      callback(new Error('Runtime registration requires a user UUID'));
      return;
    }
    if (!this.runtime.address) {
      callback(new Error('Runtime registration requires an address URL'));
      return;
    }
    if (!this.runtime.protocol) {
      callback(new Error('Runtime registration requires a protocol'));
      return;
    }
    if (!this.runtime.type) {
      callback(new Error('Runtime registration requires a type'));
      return;
    }
    if (token) {
      superagent.put(`${this.options.host}/runtimes/${this.runtime.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(this.runtime)
        .end(callback);
      return;
    }
    superagent.put(`${this.options.host}/runtimes/${this.runtime.id}`)
      .send(this.runtime)
      .end(callback);
  }

  ping(callback) {
    superagent.post(`${this.options.host}/runtimes/${this.runtime.id}`)
      .send({})
      .end((err) => {
        if (callback) {
          callback(err);
        }
      });
  }

  get(token, callback) {
    if (!token) {
      callback(new Error('API token required for fetching'));
      return;
    }
    superagent.get(`${this.options.host}/runtimes/${this.runtime.id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err) {
          callback(err);
          return;
        }
        if (res.status !== 200) {
          callback(new Error(`Request returned ${res.status}`));
          return;
        }
        Object.keys(res.body).forEach((name) => {
          if (name === 'seen' || name === 'registered') {
            this.runtime[name] = new Date(res.body[name]);
            return;
          }
          this.runtime[name] = res.body[name];
        });
        callback(null, this.runtime);
      });
  }

  del(token, callback) {
    if (!token) {
      callback(new Error('API token required for deletion'));
      return;
    }
    superagent.del(`${this.options.host}/runtimes/${this.runtime.id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        if (err && err.status === 404) {
          // If the runtime is already gone, that is fine too
          callback();
          return;
        }
        callback(err, res);
      });
  }
}

function list(token, o, c) {
  let options = o;
  let callback = c;
  if (!callback) {
    callback = options;
    options = {};
  }
  if (!token) {
    callback(new Error('API token required for fetching'));
    return;
  }

  Object.keys(defaults).forEach((name) => {
    if (options[name]) {
      return;
    }
    options[name] = defaults[name];
  });

  superagent.get(`${options.host}/runtimes/`)
    .set('Authorization', `Bearer ${token}`)
    .end((err, res) => {
      if (err) {
        callback(err);
        return;
      }
      if (res.status !== 200) {
        callback(new Error(`Request returned ${res.status}`));
        return;
      }
      const results = [];
      res.body.forEach((result) => {
        results.push(new Runtime({
          ...result,
          registered: new Date(result.registered),
          seen: new Date(result.seen),
        }, options));
      });
      callback(null, results);
    });
}

module.exports.Runtime = Runtime;
module.exports.list = list;
