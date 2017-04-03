"use strict";

var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    inlineCss = require('gulp-inline-css'),
    removeHtmlComments = require('gulp-remove-html-comments');
 
gulp.task('remove-comments', ['inline-css'], function () {
  return gulp.src('./dist/code.html')
    .pipe(removeHtmlComments())
    .pipe(gulp.dest('./dist'));
});

gulp.task('inline-css', function() {
    return gulp.src('./code.html')
        .pipe(inlineCss())
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['remove-comments'],function() {
  return gulp.src('./dist/code.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['minify']);

gulp.task('default', ['build']);

gulp.task('watch', function() {
  gulp.watch('./code.html', ['build']);
});