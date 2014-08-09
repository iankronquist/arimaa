var nomnom = require('nomnom');

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
  var cli = nomnom
    .option('grep', {})
    .parse();
  var mochaOpts = {};
  if (cli.grep) {
    mochaOpts.grep = cli.grep;
  }
  return gulp.src('build/test/**/*.js')
    .pipe(mocha(mochaOpts));
});

gulp.task('test.watch', [], function() {
  // Run the tests here instead of as a dependency so them failing doesn't stop the watch.
  gulp.run('test');
  return gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});
