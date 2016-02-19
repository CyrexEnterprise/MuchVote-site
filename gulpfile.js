// Include gulp & del
var gulp = require('gulp'); 
var del = require('del');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var copy = require('gulp-copy');
var runSequence = require('run-sequence');

var dirs = {
    source: 'src',
    release: 'dist'
}

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

// Clean
gulp.task('clean', function (cb) {
    del([dirs.release], cb);
});

// Copy files
gulp.task('copy:html', function() {
    return gulp.src(dirs.source+'/*.html')
        .pipe(copy(dirs.release, {prefix: 1}));
});
gulp.task('copy:images', function() {
    return gulp.src(dirs.source+'/images/*')
        .pipe(copy(dirs.release, {prefix: 1}));
});
gulp.task('copy:scripts', function() {
    return gulp.src([
            /*  
             * Add vendor scripts here
             * 
             * Example:
             * dirs.source+'/vendor/jquery/dist/jquery.min.js', 
             */
        ]).pipe(copy(dirs.release, {prefix: 1}));
});


// Lint Tasks
gulp.task('lint:before', function() {
    return gulp.src(dirs.source+'/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
gulp.task('lint:after', ['minify'], function() {
    return gulp.src([
            dirs.release+'/js/built.min.js',
            dirs.release+'/js/built.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('concat', function() {
    return gulp.src(dirs.source+'/js/*.js')
        .pipe(concat('built.js'))
        .pipe(gulp.dest(dirs.release+'/js'));
});
gulp.task('minify', function() {
    return gulp.src(dirs.release+'/js/built.js')
        .pipe(rename('built.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dirs.release+'/js'));
});

// Compile Sass
gulp.task('sass', function() {
    return gulp.src(dirs.source+'/css/main.scss')
        .pipe(sass())
        .on('error', handleError)
        .pipe(gulp.dest(dirs.release+'/css'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch(dirs.source+'/*.html', ['copy:html']);
    gulp.watch(dirs.source+'/js/*.js', ['lint:before', 'concat']);
    gulp.watch(dirs.source+'/css/*.scss', ['sass']);
});

// Build and release tasks
gulp.task('release', function(callback){
    runSequence('build', ['minify', 'lint:after'], callback);
}); 
gulp.task('build', function(callback){
    runSequence('clean', ['copy:images', 'copy:html', 'copy:scripts', 'sass', 'lint:before', 'concat'], callback);
}); 
gulp.task('default', ['build', 'watch']);