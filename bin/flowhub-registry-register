#!/usr/bin/env node
var registry = require('../index');
var program = require('commander');
var pkg = require('../package.json');
program
.version(pkg.version)
.option('--id <uuid>', 'Runtime UUID')
.option('--label <label>', 'Runtime label')
.option('--user <uuid>', 'Runtime owner UUID')
.option('--protocol <protocol>', 'Runtime protocol')
.option('--address <address>', 'Runtime address')
.option('--type <type>', 'Runtime type')
.option('--secret <secret>', 'Runtime secret')
.parse(process.argv);

var fail = function (message) {
  console.error(message);
  process.exit(1);
};

var required = ['id', 'user', 'protocol', 'address', 'type'];
required.forEach(function (attrib) {
  if (!program[attrib]) {
    fail('Rumtime ' + attrib + ' is required');
  }
});

var rt = new registry.Runtime({
  id: program.id,
  label: program.label,
  user: program.user,
  protocol: program.protocol,
  address: program.address,
  type: program.type,
  secret: program.secret
});

rt.register(function (err) {
  if (err) {
    fail(err.message);
    return;
  }
  console.log('Registered');
  process.exit(0);
});
