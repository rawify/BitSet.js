/**
 * @license BitSet.js v5.1.1 14/08/2015
 * http://www.xarg.org/2014/03/javascript-bit-array/
 *
 * Copyright (c) 2014, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/

'use strict';

var gulp = require('gulp');
var closureCompiler = require('google-closure-compiler').gulp();

gulp.task('compile', function() {
  return gulp.src(['bitset.js'])
          .pipe(closureCompiler({
            compilation_level: 'ADVANCED',
            externs: 'moduleExterns.js',
            language_in: 'ES6_STRICT',
            language_out: 'ES5_STRICT',
            js_output_file: 'bitset.min.js',
            warning_level: 'VERBOSE'
          }))
          .pipe(gulp.dest('.'));
});

gulp.task('default', ['compile']);
