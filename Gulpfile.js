var gulp = require("gulp");
var uglify = require('gulp-uglify');
var sourcemaps = require("gulp-sourcemaps");
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var clean = require('gulp-clean');

gulp.task('default', ['watch']);

gulp.task("js", function () {

    var b = browserify({
        entries: 'assets/javascripts/index.js',
        debug: true
    });
    
    b.bundle()
        .pipe(source('oxbuses.web.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('sass', function () {
  gulp.src('./assets/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch', function() {
    gulp.watch(['./assets/**/*.js', './assets/**/*.scss'], ['build']);
});

gulp.task('images', function() {
    gulp.src('./assets/images/*').pipe(gulp.dest('./public/images/'));
});

gulp.task('clean', function() {
    gulp.src('./public/images/*', {read: false}).pipe(clean());
});

gulp.task("build", ["clean", "images", "js", "sass"]);