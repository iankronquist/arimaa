var gulp = require('gulp');
var traceur = require('gulp-traceur');
var mocha = require('gulp-mocha');


gulp.task('build', function() {
  return gulp.src('src/**/*.js')
    .pipe(traceur())
    .pipe(gulp.dest('build/src'));
});

gulp.task('build.tests', function() {
  return gulp.src('test/**/*.js')
    .pipe(traceur())
    .pipe(gulp.dest('build/test'));
});

gulp.task('test', ['build', 'build.tests'], function() {
  return gulp.src('build/test/**/*.js')
    .pipe(mocha());
});
