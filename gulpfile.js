var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var babel = require("gulp-babel");

var uglify = require('gulp-uglify');
var pump = require('pump');
var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var minify = composer(uglifyjs, console);

gulp.task('copy-public', function () {
    console.log('to copy-public ...');
    return gulp.src('public/**', {
            base: 'public'
        })
        .pipe(gulp.dest('build/public'));
});

gulp.task('copy-views', function () {
    console.log('to copy-views ...');
    return gulp.src('views/**', {
            base: '.'
        })
        .pipe(gulp.dest('build'));
});

gulp.task('css-rev', ['copy-public', 'copy-views'], function () {
    console.log('to css-rev ...');
    return gulp.src('build/public/default/assets/css/*/*.css', {
            base: 'build/public'
        })
        .pipe(gulp.dest('build/public')) // copy original assets to build dir 
        .pipe(rev())
        // .pipe(gulp.dest('build')) // write rev'd assets to build dir 
        .pipe(rev.manifest({
            path: 'rev-manifest-css.json'
        }))
        .pipe(gulp.dest('build/public'));
});

gulp.task('css', ['css-rev'], function () {
    console.log('to css ...');
    return gulp.src(['build/public/rev-manifest-css.json', 'build/views/**/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('build/views'));
});

gulp.task('compressCss', ['css'], function () {
    return gulp.src('build/public/default/assets/css/*/*.css', {
            base: 'build/public'
        })
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('build/public'));
});


gulp.task('js-rev', ['compressCss'], function () {
    console.log('to js-rev ...');
    return gulp.src('build/public/default/assets/js/*/*.js', {
            base: 'build/public'
        })
        .pipe(gulp.dest('build/public')) // copy original assets to build dir 
        .pipe(rev())
        // .pipe(gulp.dest('build')) // write rev'd assets to build dir 
        .pipe(rev.manifest({
            path: 'rev-manifest-js.json'
        }))
        .pipe(gulp.dest('build/public'));
});

gulp.task('js', ['js-rev'], function () {
    console.log('to js ...');
    return gulp.src(['build/public/rev-manifest-js.json', 'build/views/**/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('build/views'));
});

// babel is working but I don't want use it
// gulp.task('toES5', ['js'], function () {
//     return gulp.src("build/default/assets/js/*/*.js") // ES6 源码存放的路径
//         .pipe(babel())
//         .pipe(gulp.dest("build/default/assets/js/")); //转换成 ES5 存放的路径
// });

gulp.task('compressJs', ['js'], function (cb) {
    // 动态的js需要处理
    pump([
            gulp.src(['build/public/default/assets/js/*/*.js'], {
                base: 'build'
            }),
            minify({}),
            gulp.dest('build')
        ],
        cb
    );
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

gulp.task('default', ['compressJs'], function () {
    // place code for your default task here
});