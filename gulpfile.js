/**
 * @description gulpfile for spam module
 */

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');
var runSequence = require('run-sequence');

var tests = 'test/unit/**/*.js';
var code = 'lib/**/*.js';

// set coveralls environmental variable
process.env['COVERALLS_REPO_TOKEN'] = 'hQA4FW4KHhVf0zkMVy7Hh1dT55ztCoHNx';

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
});

gulp.task('coveralls', function () {
	return gulp.src('coverage/lcov.info')
		.pipe(coveralls())
})

gulp.task('test', function() {
	return gulp.src(tests, {read: false})
	.pipe(mocha({reporter: 'spec'}))
});

gulp.task('end', function() {
	process.exit(0);
});

gulp.task('travis', function() {
	runSequence('test-coverage', 'coveralls', 'end');
});

gulp.task('coverage', function() {
	runSequence('test-coverage', 'end')
});

gulp.task('default', function() {
	runSequence('test', 'end')
})
