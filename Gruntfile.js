module.exports = function(grunt) {

	var compiledFiles = {
		'./scripts/popup.js' : './scripts/popup.js',
		'./scripts/background.js' : './scripts/background.js'
	}

	var src2CompiledFiles = {
		'./scripts/popup.js' : './src/popup.js',
		'./scripts/background.js' : './src/background.js'
	}

	// Project configuration.
	grunt.initConfig({
		groundskeeper: {
			compile: {
				files: src2CompiledFiles
			}
		},
		uglify: {
			minify: {
				files: compiledFiles
			}
		},
		jsvalidate: {
			files: ['*.js', 'src/*.js']
		},
		jshint: {
			all: ['Gruntfile.js', 'src/*.js'],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		copy: {
			main: {
				files: src2CompiledFiles
			}
		},
		watch: {
		 files: ['src/*.js', ".jshintrc", "*js"],
		 tasks: ['devcompile']
		}
	});

	grunt.loadNpmTasks('grunt-jsvalidate');
	grunt.loadNpmTasks('grunt-groundskeeper');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('compile', ['jsvalidate', 'groundskeeper', 'uglify']);
	grunt.registerTask('devcompile', ['jsvalidate', 'copy:main']);

	// Default task(s).
	grunt.registerTask('default', 'compile');
};