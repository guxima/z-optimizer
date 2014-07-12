var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');


gulp.task('default', function(){
	gulp.src([
        'core/utils.js',
        'core/observer-factory.js',
        'core/zop.js',
        'core/dataset.js',
        'core/preference.js',

        'formats/format.js',
        'formats/topx-used-method.js',
        'formats/topx-average-duration-method.js',
        'formats/topx-duration-method.js',

        'ui/tableview.js',
        'ui/dashboard.js'
    ])
    .pipe(concat('zoptimizer.js'))
    .pipe(insert.prepend(';(function(){'))
    .pipe(insert.append('})();'))
    .pipe(gulp.dest('.'));

    gulp.src('zoptimizer.js')
    .pipe(concat('zoptimizer.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('.'))
});