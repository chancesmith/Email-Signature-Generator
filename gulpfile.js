"use strict";

var gulp = require('gulp'),
    path = require('path'),
    plumber = require('gulp-plumber'), //prevent breaks in watchs when errors occur
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

// HTML tasks
gulp.task('html', function () {
    gulp.src('*.html')
        .pipe(reload({
            stream: true
        }));
});

///////////////////////////
// Static server
///////////////////////////
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

// Watch for file changes
gulp.task('watch', function () {
    gulp.watch("*.html").on('change', browserSync.reload);
    gulp.watch("clients/*.html").on('change', browserSync.reload);
});

//gulp.task('default', ['concatScripts', 'less', 'html', 'php', 'browser-sync', 'watch']);
gulp.task('default', ['html', 'browser-sync', 'watch']);