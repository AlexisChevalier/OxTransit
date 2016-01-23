var gulp = require("gulp");
var uglify = require('gulp-uglify');
var sourcemaps = require("gulp-sourcemaps");
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');

gulp.task('default', ['watch']);

gulp.task("buildBrowser", function () {

    var b = browserify({
        entries: 'src/index.js',
        debug: true
    });

    b.bundle()
        .pipe(source('oxbuses.web.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));

    b.bundle()
        .pipe(source('oxbuses.web.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['build']);
});

gulp.task("build", ["buildBrowser"]);