/**
 * @description gulpfile for spam module
 */

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

var tests = 'test/unit/**/*.js';
var code = 'lib/**/*.js';

gulp.task('pre-coverage', function () {
	return gulp.src(code)
		// Covering files
		.pipe(istanbul())
		// Force `require` to return covered files
		.pipe(istanbul.hookRequire());
});

gulp.task('test-coverage', ['pre-coverage'], function () {
	return gulp.src(tests)
		.pipe(mocha())
		// Creating the reports after tests ran
		.pipe(istanbul.writeReports())
		.once('error', () => {
				process.exit(1);
		})
		.once('end', () => {
			process.exit();
		})
});

gulp.task('test', () =>
	gulp.src(tests, {read: false})
	.pipe(mocha({reporter: 'spec'}))
	.once('error', () => {
		process.exit(1);
	})
	.once('end', () => {
  	process.exit();
	})
);

gulp.task('default', [ 'test' ]);
gulp.task('coverage', [ 'test-coverage' ]);
