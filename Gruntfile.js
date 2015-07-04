'use strict';

module.exports = function(grunt) {
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),


      sass: {
         options: {
            includePaths: ['app/bower_components/foundation/scss', 'app/scss']
         },
         dist: {
            options: {
               outputStyle: 'extended',
            },
            files: {
               'dev/css/app.css': 'app/scss/app.scss'
            }
         }
      },


      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         all: [
            'Gruntfile.js',
            'app/js/**/*.js'
         ]
      },


      clean: {
         dist: {
            src: ['dist/*']
         },
      },


      copy: {
         dev: {
            files: [{
               expand: true,
               cwd:'app/',
               src: ['images/**', 'js/**', 'fonts/**', '**/*.html', '!**/*.scss', 'bower_components/**'],
               dest: 'dev/'
            } , {
               expand: true,
               flatten: true,
               src: ['app/bower_components/font-awesome/fonts/**'],
               dest: 'dev/fonts/',
               filter: 'isFile'
            } ]
         },
         dist: {
            files: [{
               expand: true,
               cwd:'app/',
               src: ['images/**', 'fonts/**', '**/*.html', '!**/*.scss', '!bower_components/**'],
               dest: 'dist/'
            } , {
               expand: true,
               flatten: true,
               src: ['app/bower_components/font-awesome/fonts/**'],
               dest: 'dist/fonts/',
               filter: 'isFile'
            } ]
         },
      },


      uglify: {
         options: {
            preserveComments: 'some',
            mangle: false
         }
      },


      useminPrepare: {
         html: ['app/**/*.html', '!app/bower_components/**'],
         options: {
            dest: 'dist'
         }
      },


      usemin: {
         html: ['dist/**/*.html', '!app/bower_components/**'],
         css: ['dist/css/**/*.css'],
         options: {
            dirs: ['dist']
         }
      },


      watch: {
         grunt: {
            files: ['Gruntfile.js'],
            tasks: ['sass']
         },
         sass: {
            files: 'app/scss/**/*.scss',
            tasks: ['sass']
         },
         livereload: {
            files: ['dev/**/*.html', '!dev/bower_components/**', 'dev/js/**/*.js', 'dev/css/**/*.css', 'dev/images/**/*.{jpg,gif,svg,jpeg,png}'],
            options: {
               livereload: true
            }
         }
      },


      connect: {
         dev: {
            options: {
               port: 9000,
               base: 'dev/',
               open: true,
               livereload: true
            }
         },
         dist: {
            options: {
               port: 9001,
               base: 'dist/',
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

   grunt.registerTask('build', ['sass']);
   grunt.registerTask('default', ['build','copy:dev', 'connect:dev', 'watch']);
   grunt.registerTask('validate-js', ['jshint']);
   grunt.registerTask('server-dist', ['connect:dist']);
   grunt.registerTask('publish', ['clean:dist', 'validate-js', 'useminPrepare', 'copy:dist', 'concat', 'cssmin', 'uglify', 'usemin']);
};
