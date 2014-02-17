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

describe 'Runtime', ->
  data =
    id: id
    label: 'Test runtime'
    user: owner
    protocol: 'websocket'
    address: 'ws://localhost:3569'
    type: 'test'
    secret: 'hello world'
  rt = new registry.Runtime data, options
  firstseen = null

  it 'should be possible to register', (done) ->
    rt.register (err, ok) ->
      chai.expect(err).to.be.a 'null'
      done()
  it 'should be possible to fetch', (done) ->
    rt.get token, (err, ok) ->
      chai.expect(err).to.be.a 'null'
      for name, value of data
        chai.expect(rt.runtime[name]).to.equal value
      chai.expect(rt.runtime.registered.getTime()).to.be.above 0
      chai.expect(rt.runtime.seen.getTime()).to.be.above 0
      firstseen = rt.runtime.seen
      done()
  it 'when pinged the "seen" value should change', (done) ->
    # First we ping
    rt.ping (err) ->
      chai.expect(err).to.be.a 'null'

      # Then we fetch
      rt.get token, (err, ok) ->
        chai.expect(err).to.be.a 'null'
        chai.expect(rt.runtime.seen.getTime()).to.be.above firstseen.getTime()
        done()

  it 'should be possible to delete', (done) ->
    rt.del token, (err, ok) ->
      chai.expect(err).to.be.a 'null'
      done()
