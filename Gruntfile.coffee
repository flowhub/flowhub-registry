module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Browser build of NoFlo
    noflo_browser:
      build:
        files:
          'browser/flowhub-registry.js': ['package.json']

    # BDD tests on Node.js
    mochaTest:
      nodejs:
        src: ['spec/*.coffee']
        options:
          reporter: 'spec'

  @loadNpmTasks 'grunt-noflo-browser'
  @loadNpmTasks 'grunt-mocha-test'

  @registerTask 'build', [
    'noflo_browser'
  ]
  @registerTask 'test', [
    'build',
    'mochaTest'
  ]
