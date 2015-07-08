'use strict';

module.exports = function(grunt) {
   var development = (
      grunt.cli.tasks.indexOf('publish') === -1 &&
      grunt.cli.tasks.indexOf('preview-dist') === -1
   );

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      /**
       * All the paths for the project
       */
      project: {
         /**
          * Paths for stuff installed from npm
          */
         lib: {
            node: 'node_modules'
         },

         /**
          * Paths for source code
          */
         src: {
            root: 'app',
            sass: '<%= project.src.root %>/scss',
            js: '<%= project.src.root %>/js'
         },

         /**
          * Development build target
          */
         dev: {
            root: 'dev',
            css: '<%= project.dev.root %>/css',
            js: '<%= project.dev.root %>/js'
         },

         /**
          * Deploy build target
          */
         dist: {
            root: 'dist',
            css: '<%= project.dist.root %>/css',
            js: '<%= project.dist.root %>/js'
         },

         /**
          * Place for temporary build files
          */
         tmp: {
            root: '.tmp',
            css: '<%= project.tmp.root %>/css'
         },

         target: {
            root: development ? '<%= project.dev.root %>' : '<%= project.dist.root %>',
            css: development ? '<%= project.dev.css %>' : '<%= project.dist.css %>',
            sasstarget: development ? '<%= project.dev.css %>' : '<%= project.tmp.css %>',
            js: development ? '<%= project.dev.js %>' : '<%= project.dist.js %>'
         }
      },


      sass: {
         options: {
            includePaths: ['<%= project.src.sass %>']
         },
         build: {
            options: {
               outputStyle: 'extended',
            },
            files: {
               '<%= project.target.sasstarget %>/app.css': '<%= project.src.sass %>/app.scss'
            }
         }
      },


      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         all: [
            'Gruntfile.js',
            '<%= project.src.js %>/**/*.js'
         ]
      },


      clean: {
         build: {
            src: [ '<%= project.target.root %>/*', '<%= project.tmp.root %>/*' ]
         },
      },


      copy: {
         build: {
            files: [{
               expand: true,
               cwd:'<%= project.src.root %>/',
               src: ['images/**', 'fonts/**', '**/*.html', '!**/*.scss'],
               dest: '<%= project.target.root %>/'
            } ]
         },
         dev: {
            files: [{
               expand: true,
               cwd:'<%= project.src.root %>/',
               src: ['js/**'],
               dest: '<%= project.target.root %>/'
            } ]
         }
      },


      uglify: {
         options: {
            preserveComments: 'some',
            mangle: false
         }
      },


      useminPrepare: {
         html: ['<%= project.src.root %>/**/*.html'],
         options: {
            dest: '<%= project.target.root %>'
         }
      },


      usemin: {
         html: ['<%= project.target.root %>/**/*.html'],
         css: ['<%= project.target.css %>/**/*.css'],
         options: {
            dirs: ['<%= project.target.root %>']
         }
      },


      watch: {
         grunt: {
            files: ['Gruntfile.js'],
            tasks: ['sass']
         },
         sass: {
            files: '<%= project.src.sass %>/**/*.scss',
            tasks: ['sass']
         },
         livereload: {
            files: [
               '<%= project.src.root %>/**/*.html',
               '<%= project.src.js %>/**/*.js',
               '<%= project.src.sass %>/**/*.css',
               '<%= project.src.root %>/images/**/*.{jpg,gif,svg,jpeg,png}'
            ],
            options: {
               livereload: true
            }
         }
      },


      connect: {
         dev: {
            options: {
               port: 9000,
               base: '<%= project.dev.root %>/',
               open: true,
               livereload: true
            }
         },
         dist: {
            options: {
               port: 9001,
               base: '<%= project.dist.root %>/',
               open: true,
               keepalive: true,
               livereload: false
            }
         }
      }

   });

   grunt.loadNpmTasks('grunt-sass');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-cssmin');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-connect');
   grunt.loadNpmTasks('grunt-usemin');

   grunt.registerTask('build-base', ['jshint', 'clean:build', 'sass', 'copy:build']);
   grunt.registerTask('build', ['build-base', 'copy:dev']);
   grunt.registerTask('default', ['build', 'connect:dev', 'watch']);
   grunt.registerTask('preview-dist', ['connect:dist']);
   grunt.registerTask('publish', ['build-base', 'useminPrepare', 'concat', 'cssmin', 'uglify', 'usemin']);
};
