registry = require '../index'
chai = require 'chai'

owner = process.env.USER_ID
token = process.env.USER_TOKEN
id = require('uuid').v4()
secret = 'hello world'

options = {}
# options.host = 'http://localhost:5000'

unless owner and token
  throw new Error 'Test environment data missing'

describe 'User\'s Runtime Registry', ->
  data =
    id: id
    label: 'Test runtime'
    user: owner
    protocol: 'websocket'
    address: 'ws://localhost:3569'
    type: 'test'
    secret: 'hello world'
  rt = new registry.Runtime data, options

  it 'should not contain the runtime before registering', (done) ->
    registry.list token, options, (err, runtimes) ->
      chai.expect(err).to.be.a 'null'
      chai.expect(runtimes).to.be.an 'array'
      runtimes.forEach (runtime) ->
        chai.expect(runtime.runtime.id).to.not.equal id
      done()
  it 'should contain the runtime after registering', (done) ->
    rt.register (err, ok) ->
      chai.expect(err).to.be.a 'null'
      registry.list token, options, (err, runtimes) ->
        chai.expect(runtimes).to.be.an 'array'
        found = false
        runtimes.forEach (runtime) ->
          found = true if runtime.runtime.id is id
        chai.expect(found).to.be.true
        done()
  it 'should not contain the runtime after deletion', (done) ->
    rt.del token, (err, ok) ->
      chai.expect(err).to.be.a 'null'
      registry.list token, options, (err, runtimes) ->
        chai.expect(err).to.be.a 'null'
        chai.expect(runtimes).to.be.an 'array'
        runtimes.forEach (runtime) ->
          chai.expect(runtime.runtime.id).to.not.equal id
        done()
