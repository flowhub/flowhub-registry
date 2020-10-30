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
      done null, [403, 'Unauthorized to modify runtime']
      return
    runtimes[id] = {} unless runtimes[id]
    for key, val of body
      runtimes[id][key] = val
    now = new Date
    runtimes[id].seen = now
    runtimes[id].registered = now unless runtimes[id].registered
    done null, [200, runtimes[id]]
    return
  )

exports.pingRuntime = (id) ->
  nock('https://api.flowhub.io')
  .post("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    unless runtimes[id]
      done null, [404, 'Runtime not found']
      return
    runtimes[id].seen = new Date
    done null, [200]
    return
  )

exports.listRuntimes = ->
  nock('https://api.flowhub.io')
  .get("/runtimes/")
  .reply((path, requestBody, done) ->
    user = exports.authenticate @req.headers
    unless user
      done null, [401, 'Authentication required']
      return
    userRuntimes = []
    for id, runtime of runtimes
      continue unless runtime.user is user.id
      userRuntimes.push runtime
    done null, [200, userRuntimes]
    return
  )

exports.getRuntime = (id) ->
  nock('https://api.flowhub.io')
  .get("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    user = exports.authenticate @req.headers
    unless user
      done null, [401, 'Authentication required']
      return
    unless runtimes[id]
      done null, [404, 'Runtime not found']
      return
    unless runtimes[id].user is user.id
      done null, [403, 'Unauthorized']
      return
    done null, [200, runtimes[id]]
    return
  )

exports.deleteRuntime = (id) ->
  nock('https://api.flowhub.io')
  .delete("/runtimes/#{id}")
  .reply((path, requestBody, done) ->
    user = exports.authenticate @req.headers
    unless user
      done null, [401, 'Authentication required']
      return
    unless runtimes[id]
      done null, [404, 'Runtime not found']
      return
    unless runtimes[id].user is user.id
      done null, [403, 'Unauthorized']
      return
    delete runtimes[id]
    done null, [204]
    return
  )

exports.cleanUp = ->
  runtimes = {}
  nock.cleanAll()
