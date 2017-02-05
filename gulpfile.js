var gulp = require('gulp');
var mocha = require('gulp-mocha');

var tests = 'test/unit/**/*.js';

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
