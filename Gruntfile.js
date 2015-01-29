'use strict';

module.exports = function( grunt ){

	require('load-grunt-tasks')( grunt );

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		simplemocha: {
			all: { src: 'test/**/*test.js' }
		}

	});

	grunt.registerTask( 'test', ['simplemocha']);

};