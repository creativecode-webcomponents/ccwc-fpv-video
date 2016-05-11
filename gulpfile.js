var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var esdoc = require('gulp-esdoc');
var ghPages = require('gulp-gh-pages');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var gl2js = require('gulp-gl2js');

gulp.task('ccwc-rift-video', function () {
    return browserify({
        entries: 'src/ccwc-rift-video.es6',
        standalone: 'CCWCRiftVideo',
        extensions: ['es2015'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('ccwc-rift-video.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src'));
});

gulp.task('shaders', function() {
    return gulp.src('./src/shaders/*.glsl')
        .pipe(gl2js('shaders', { extension: 'es6', module: true } ))
        .pipe(gulp.dest('./src'));
});


gulp.task('default', ['shaders', 'ccwc-rift-video']);