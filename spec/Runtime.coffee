registry = require '../index'
chai = require 'chai'
uuid = require 'uuid'
mocks = require './helpers/mocks'

describe 'Runtime', ->
  options = {}
  inputData = null
  secret = 'hello world'
  user = null
  rt = null
  firstseen = null
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

  it 'should be possible to register', (done) ->
    updateRuntime = mocks.updateRuntime inputData.id
    rt.register (err, ok) ->
      return done err if err
      chai.expect(updateRuntime.isDone()).to.equal true
      done()
  it 'should be possible to fetch', (done) ->
    getRuntime = mocks.getRuntime inputData.id
    rt.get user.token, (err, ok) ->
      return done err if err
      for name, value of inputData
        chai.expect(rt.runtime[name]).to.equal value
      chai.expect(rt.runtime.registered.getTime()).to.be.above 0
      chai.expect(rt.runtime.seen.getTime()).to.be.above 0
      firstseen = rt.runtime.seen
      chai.expect(getRuntime.isDone()).to.equal true
      done()
  it 'when pinged the "seen" value should change', (done) ->
    pingRuntime = mocks.pingRuntime inputData.id
    getRuntime = mocks.getRuntime inputData.id

    # First we ping
    rt.ping (err) ->
      return done err if err

      # Then we fetch
      rt.get user.token, (err, ok) ->
        return done err if err
        chai.expect(rt.runtime.seen.getTime()).to.be.above firstseen.getTime()
        chai.expect(pingRuntime.isDone()).to.equal true
        chai.expect(getRuntime.isDone()).to.equal true
        done()
  it 'should be possible to update', (done) ->
    newAddress = 'ws://example.net:3569'
    updateRuntime = mocks.updateRuntime inputData.id
    getRuntime = mocks.getRuntime inputData.id
    rt.runtime.address = newAddress
    rt.register (err) ->
      return done err if err
      chai.expect(updateRuntime.isDone()).to.equal true
      rt.get user.token, (err) ->
        return done err if err
        chai.expect(rt.runtime.address).to.equal newAddress
        chai.expect(getRuntime.isDone()).to.equal true
        done()
  it 'should be possible to delete', (done) ->
    deleteRuntime = mocks.deleteRuntime inputData.id
    getRuntime = mocks.getRuntime inputData.id
    rt.del user.token, (err, ok) ->
      return done err if err
      # Verify that it is gone
      rt.get user.token, (err, ok) ->
        chai.expect(err).to.be.an 'error'
        chai.expect(deleteRuntime.isDone()).to.equal true
        chai.expect(getRuntime.isDone()).to.equal true
        done()
  it 'should be possible to call delete on removed runtime', (done) ->
    deleteRuntime = mocks.deleteRuntime inputData.id
    getRuntime = mocks.getRuntime inputData.id
    rt.del user.token, (err, ok) ->
      return done err if err
      done()
