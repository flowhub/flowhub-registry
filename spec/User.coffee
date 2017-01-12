registry = require '../index'
chai = require 'chai'
uuid = require 'uuid'
mocks = require './helpers/mocks'

id = require('uuid').v4()
secret = 'hello world'

# options.host = 'http://localhost:5000'

describe 'User\'s Runtime Registry', ->
  options = {}
  inputData = null
  secret = 'hello world'
  user = null
  rt = null
  before ->
    user = mocks.setupUser uuid.v4()
    inputData =
      id: uuid.v4()
      label: 'Test runtime'
      user: user.id
      protocol: 'websocket'
      address: 'ws://localhost:3569'
      type: 'test'
      secret: secret
    rt = new registry.Runtime inputData, options
  after ->
    mocks.cleanUp()

  it 'should not contain the runtime before registering', (done) ->
    listRuntimes = mocks.listRuntimes()
    registry.list user.token, options, (err, runtimes) ->
      return done err if err
      chai.expect(runtimes).to.eql []
      chai.expect(listRuntimes.isDone()).to.equal true
      done()
  it 'should contain the runtime after registering', (done) ->
    updateRuntime = mocks.updateRuntime inputData.id
    listRuntimes = mocks.listRuntimes()
    rt.register (err, ok) ->
      return done err if err
      registry.list user.token, options, (err, runtimes) ->
        return done err if err
        chai.expect(runtimes).to.be.an 'array'
        found = false
        runtimes.forEach (runtime) ->
          found = true if runtime.runtime.id is inputData.id
        chai.expect(found).to.be.true
        chai.expect(updateRuntime.isDone()).to.equal true
        chai.expect(listRuntimes.isDone()).to.equal true
        done()
  it 'should not contain the runtime after deletion', (done) ->
    deleteRuntime = mocks.deleteRuntime inputData.id
    listRuntimes = mocks.listRuntimes()
    rt.del user.token, (err, ok) ->
      return done err if err
      registry.list user.token, options, (err, runtimes) ->
        return done err if err
        chai.expect(runtimes).to.eql []
        chai.expect(deleteRuntime.isDone()).to.equal true
        chai.expect(listRuntimes.isDone()).to.equal true
        done()
