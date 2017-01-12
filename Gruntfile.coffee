module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Browser build of NoFlo
    noflo_browser:
      build:
        options:
          exposed_modules:
            'flowhub-registry': './index'
            'uuid': 'uuid'
        files:
          'browser/flowhub-registry.js': ['package.json']

    # BDD tests on Node.js
    mochaTest:
      nodejs:
        src: ['spec/*.coffee']
        options:
          reporter: 'spec'
          grep: process.env.TESTS

  @loadNpmTasks 'grunt-noflo-browser'
  @loadNpmTasks 'grunt-mocha-test'

  @registerTask 'build', [
    'noflo_browser'
  ]
  @registerTask 'test', [
    'build',
    'mochaTest'
  ]
