var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
// var pump = require('pump');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

gulp.task('css-rev', function () {
    return gulp.src('public/default/assets/css/*/*.css', {
            base: 'public'
        })
        .pipe(gulp.dest('build')) // copy original assets to build dir 
        .pipe(rev())
        // .pipe(gulp.dest('build')) // write rev'd assets to build dir 
        .pipe(rev.manifest({
            path: 'rev-manifest-css.json'
        }))
        .pipe(gulp.dest('build'));
    //动态的css需要处理
    // return gulp.src('public/default/assets/css/*/*.css', {
    //         base: '.'
    //     })
    //     .pipe(cleanCSS({
    //         compatibility: 'ie8'
    //     }))
    //     .pipe(gulp.dest('build'));
});

gulp.task('css', ['css-rev'], function () {
    console.log('开始--修改 css 引用链接的资源版本号...');
    return gulp.src(['build/rev-manifest-css.json', 'views/**/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('views'));
});

gulp.task('compressJs', function (cb) {
    //动态的js需要处理
    // pump([
    //         gulp.src(['public/default/assets/js/*/*.js'], {
    //             base: '.'
    //         }),
    //         uglify(),
    //         gulp.dest('build')
    //     ],
    //     cb
    // );
});

gulp.task('rev', ['minify-css', 'compressJs'], function () {
    // return gulp.src(['build/public/**/*.css', 'build/public/**/*.js'])
    //     .pipe(gulp.dest('build/public')) // copy original assets to build dir 
    //     .pipe(rev())
    //     .pipe(gulp.dest('dist/public')) // write rev'd assets to build dir 
    //     .pipe(rev.manifest())
    //     .pipe(gulp.dest('dist/public'));
});

gulp.task('replace', ['rev'], function () {
    // return gulp.src(['dist/public/rev-manifest.json', 'views/**/*.html'])
    //     .pipe(revCollector({
    //         replaceReved: true,
    //     }))
    //     .pipe(htmlmin({
    //         collapseWhitespace: true
    //     }))
    //     .pipe(gulp.dest('dist/views'));
});

gulp.task('copy-static', function (cb) {
    // return gulp.src(['public/default/assets/css/*.css', 'public/default/assets/js/*.js'], {
    //         base: '.'
    //     })
    //     .pipe(gulp.dest('dist'));
});

gulp.task('compress', function (cb) {
    // pump([
    //         gulp.src(['routes/**/*.js', 'models/**/*.js', 'util/**/*.js', 'settings.js'], { base: '.' }),
    //         uglify(),
    //         gulp.dest('dist')
    //     ],
    //     cb
    // );
});

// gulp.task('rev', ['minify-html', 'minify-css'], function() {
//     gulp.src('views/Client/partial/main.html')
//         .pipe(rev())
//         .pipe(gulp.dest('dist/test'));
// });

gulp.task('default', ['css'], function () {
    // place code for your default task here
});