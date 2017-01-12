nock = require 'nock'
uuid = require 'uuid'

users = {}
runtimes = {}

exports.setupUser = (id) ->
  users[id] =
    id: id
    token: uuid.v4()
  users[id]

exports.authenticate = (headers) ->
  unless headers.authorization
    return null
  if headers.authorization.indexOf('Bearer') is -1
    return null
  token = headers.authorization.substr 7
  for id, user of users
    return user if user.token is token
  null

exports.updateRuntime = (id) ->
  nock('https://api.flowhub.io')
  .put("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    body = if typeof requestBody is 'object' then requestBody else JSON.parse requestBody
    if runtimes[id] and body.secret isnt runtimes[id].secret
      return done null, [403, 'Unauthorized to modify runtime']
    runtimes[id] = {} unless runtimes[id]
    for key, val of body
      runtimes[id][key] = val
    now = new Date
    runtimes[id].seen = now
    runtimes[id].registered = now unless runtimes[id].registered
    done null, runtimes[id]
  )

exports.pingRuntime = (id) ->
  nock('https://api.flowhub.io')
  .post("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    unless runtimes[id]
      return done null, [404, 'Runtime not found']
    runtimes[id].seen = new Date
    done null, [200]
  )

exports.listRuntimes = ->
  nock('https://api.flowhub.io')
  .get("/runtimes/")
  .reply((path, requestBody, done) ->
    user = exports.authenticate @req.headers
    unless user
      return done null, [401, 'Authentication required']
    userRuntimes = []
    for id, runtime of runtimes
      continue unless runtime.user is user.id
      userRuntimes.push runtime
    done null, userRuntimes
  )

exports.getRuntime = (id) ->
  nock('https://api.flowhub.io')
  .get("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    user = exports.authenticate @req.headers
    unless user
      return done null, [401, 'Authentication required']
    unless runtimes[id]
      return done null, [404, 'Runtime not found']
    unless runtimes[id].user is user.id
      return done null, [403, 'Unauthorized']
    done null, runtimes[id]
  )

exports.deleteRuntime = (id) ->
  nock('https://api.flowhub.io')
  .delete("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    user = exports.authenticate @req.headers
    unless user
      return done null, [401, 'Authentication required']
    unless runtimes[id]
      return done null, [404, 'Runtime not found']
    unless runtimes[id].user is user.id
      return done null, [403, 'Unauthorized']
    delete runtimes[id]
    done null, [204]
  )

exports.cleanUp = ->
  runtimes = {}
  nock.cleanAll()
