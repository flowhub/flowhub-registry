module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Browser version building
    exec:
      install:
        command: 'node ./node_modules/component/bin/component install'
      build:
        command: 'node ./node_modules/component/bin/component build -u component-json,component-coffee -o browser -n flowhub-api -c'

    # BDD tests on Node.js
    mochaTest:
      nodejs:
        src: ['spec/*.coffee']
        options:
          reporter: 'spec'

  @loadNpmTasks 'grunt-exec'
  @loadNpmTasks 'grunt-mocha-test'

  @registerTask 'build', ['exec:install', 'exec:build']
  @registerTask 'test', ['build', 'mochaTest']
