module.exports = function(grunt) {
  'use strict';

  var tests = 'test/*.js';
  var tasks = ['server/*.js', 'server.js'];
  var reportDir = 'build/reports/';

  grunt.initConfig({
    clean : [ 'build' ],
    /*nodeunit : {
      files : [ tests ]
    },*/
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: tests
    },
    watch : {
      files : [ tasks, tests ],
      tasks : 'default'
    },
    jshint : {
      files : [ 'Gruntfile.js', tasks, tests ],
      options : {
        curly : true,
        eqeqeq : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        undef : true,
        boss : true,
        eqnull : true,
        node : true
      },
      globals : {}
    },
    instrument : {
      files : tasks,
      options : {
        lazy : true,
        basePath : 'build/instrument/'
      }
    },
    reloadTasks : {
      rootPath : 'build/instrument/'
    },
    storeCoverage : {
      options : {
        dir : reportDir
      }
    },
    makeReport : {
      src : 'build/reports/**/*.json',
      options : {
        type : ['lcov', 'html'],
        dir : reportDir,
        print : 'detail'
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('default', 'jshint');
  grunt.registerTask('cover', [ 'clean', 'instrument', 'reloadTasks', 'test',
      'storeCoverage', 'makeReport' ]);

};