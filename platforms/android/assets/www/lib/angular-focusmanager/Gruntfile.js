module.exports = function (grunt) {

    var tasks = [
        'jshint',
        'ngAnnotate',
        'replace',
        'uglify',
        'copy'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*\n' +
        '* <%= pkg.name %>\n' +
        '* Version: <%= pkg.version %>\n' +
        '* Obogo (c) ' + new Date().getFullYear() + '\n' +
        '* https://github.com/obogo/<%= pkg.filename %>\n' +
        '* License: MIT.\n' +
        '*/\n',
        jshint: {
            // define the files to lint
            files: ['src/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    loopfunc: false
                }
            }
        },
        copy: {
            build: {
                files: [
                    {expand: true, cwd: 'src/styles', src: ['*.css'], dest: 'build/css'}
                ]
            }
        },
        ngAnnotate: {
            build: {
                files: {
                    './build/<%= pkg.filename %>.js': [
                        'src/consts.js',
                        'src/**/*.js'
                    ]
                }
            }
        },
        replace: {
            "build": {
                options: {
                    patterns: [
                        {
                            match: 'moduleName',
                            replacement: '<%= pkg.packageName %>'
                        }
                    ]
                },
                files: [
                    {
                        src: ['./build/<%= pkg.filename %>.js'],
                        dest: './build/<%= pkg.filename %>.js'
                    },
                    {
                        src: ['./build/<%= pkg.filename %>.min.js'],
                        dest: './build/<%= pkg.filename %>.min.js'
                    }
                ]
            }
        },
        uglify: {
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: false,
                    beautify: true,
                    exportAll: false,
                    banner: '<%= banner %>',
                    wrap: '<%= pkg.packageName %>'
                },
                files: {
                    './build/<%= pkg.filename %>.js': ['./build/<%= pkg.filename %>.js']
                }
            },
            build_min: {
                options: {
                    report: 'gzip',
                    banner: '<%= banner %>',
                    sourceMap: true
                },
                files: {
                    './build/<%= pkg.filename %>.min.js': ['./build/<%= pkg.filename %>.js']
                }
            }
        },

        bump: {
            "options": {
                files: ['package.json', 'build/angular-focusmanager.js', 'build/angular-focusmanager.min.js', 'README.md'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'release v%VERSION%',
                commitFiles: ['package.json', 'build/angular-focusmanager.js', 'build/angular-focusmanager.min.js', 'README.md'],
                createTag: true,
                tagName: '%VERSION%',
                tagMessage: '%VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', tasks);

};