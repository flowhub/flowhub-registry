Flowhub Runtime Registry library [![Build Status](https://secure.travis-ci.org/flowhub/flowhub-registry.png?branch=master)](http://travis-ci.org/flowhub/flowhub-registry)
================================

This library provides easy access to the [Flowhub](http://flowhub.io) runtime registry. It is intended to be used by [Flow-Based Programming Protocol](http://noflojs.org/documentation/protocol/) compatible clients to register themselves available for Flowhub users.

Usage:

```javascript
var flowhub = require('flowhub-registry');

// Prepare runtime information
var rt = new flowhub.Runtime({
  // Human-readable label for the runtime
  label: 'My home NoFlo system',
  // Unique identifier of the runtime instance (must be valid UUID)
  id: '754c5dc0-97e9-11e3-a5e2-0800200c9a66',
  // Flowhub user that should have access to the runtime (must be valid UUID)
  user: '89454800-97e9-11e3-a5e2-0800200c9a66',
  // Protocol to be used, eg. websocket, iframe, or webrtc
  protocol: 'websocket',
  // URL to the runtime
  address: 'ws://some.server.address:3569',
  // Type of the runtime, eg. noflo-nodejs or microflo
  type: 'noflo-nodejs',
  // Secret string for the user to utilize for communication (optional)
  secret: 'C6sxubeP22u4'
});

// Register the Runtime with Flowhub
rt.register(function (err, ok) {
  if (err) {
    alert('Registration failed');
  }
});
```

In addition to registering the runtime, it is a good idea to periodically ping Flowhub to let the user know that the runtime is still available.

```javascript
setInterval(function () {
  rt.ping();
}, 5 * 60 * 1000);
```

If you have access to the user's OAuth token you can also remove a registered runtime:

```javascript
rt.del('nch9138ohf2892fhgf92g8f942fh2938gf3', function (err, ok) {
});
```
