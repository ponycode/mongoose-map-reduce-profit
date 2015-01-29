'use strict';

module.exports = function( grunt ){

	require('load-grunt-tasks')( grunt );

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		simplemocha: {
			all: { src: 'test/**/*-test.js' }
		}

	});

	grunt.loadTasks( "./grunt-tasks" );

	grunt.registerTask( 'compileCss', ['less', 'cssmin']);
	grunt.registerTask( 'compileJs', ['uglify']);

	grunt.registerTask( 'lintCss', ['lesslint']);
	grunt.registerTask( 'lintJs', ['eslint']);
	grunt.registerTask( 'lint', ['lesslint','lintJs']);
	
	grunt.registerTask( 'default', ['lintJs', 'lintCss', 'compileJs', 'compileCss']);
	grunt.registerTask( 'test', ['simplemocha']);
	grunt.registerTask( 'start', ['compileCss', 'compileJs', 'supervisor', 'open']);

};