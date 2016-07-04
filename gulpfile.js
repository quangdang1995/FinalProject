var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var browserSync = require('browser-sync');
var browserSynsSpa = require('browser-sync-spa');
var del = require('del');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var newer = require('gulp-newer');
var wiredep = require('wiredep').stream;

gulp.task('lint', function () {
  return gulp.src('src/client/app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('script', ['lint'], function () {
  gulp.src(['src/client/app/**/*.module.js', 'src/client/app/**/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
      //.pipe(ngAnnotate())
      //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/scripts'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('style', function () {
  gulp.src('src/client/**/*.scss')
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('wiredep', function () {
  gulp.src('build/index.html')
    .pipe(wiredep({
      
    }))
    .pipe(gulp.dest('build/'))    
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('html', function () {
  gulp.src('src/client/**/*.html', {base: 'src/client/'})
    .pipe(gulp.dest('build/'));
});

gulp.task('html-build', function callback() {
  runSequence('html', 'wiredep', callback)
})

gulp.task('watch', ['browserSync'], function () {
  gulp.watch('src/client/app/**/*.js', ['lint', 'script']);
  gulp.watch('src/client/**/*.scss', ['style']);
  gulp.watch('src/client/**/*.html', ['html-build']);
});

gulp.task('browserSync', function() {
  browserSync.use(browserSynsSpa({
    selector: "[ng-app]"
  }));
  
  browserSync.init({
    open: false,
    server: {
      baseDir: 'build'
    }
  });
});

gulp.task('clean', function () {
  return del.sync('build');
});

gulp.task('build', function (callback) {
  runSequence(['style', 'script', 'html'], 'wiredep', callback);
});

gulp.task('default', function (callback) {
  runSequence('clean', ['style', 'script', 'html'], 'wiredep', ['browserSync', 'watch'], callback);
});