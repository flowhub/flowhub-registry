/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function() {
  // Project configuration
  this.initConfig({
    pkg: this.file.readJSON('package.json'),

    // Browser build of NoFlo
    noflo_browser: {
      build: {
        options: {
          exposed_modules: {
            'flowhub-registry': './index',
            'uuid': 'uuid'
          }
        },
        files: {
          'browser/flowhub-registry.js': ['package.json']
        }
      }
    },

    // BDD tests on Node.js
    mochaTest: {
      nodejs: {
        src: ['spec/*.coffee'],
        options: {
          reporter: 'spec',
          grep: process.env.TESTS
        }
      }
    }
  });

  this.loadNpmTasks('grunt-noflo-browser');
  this.loadNpmTasks('grunt-mocha-test');

  this.registerTask('build', [
    'noflo_browser'
  ]);
  return this.registerTask('test', [
    'build',
    'mochaTest'
  ]);
};
