var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var babel = require("gulp-babel");
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var pump = require('pump');
// var replace = require('gulp-replace');
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

gulp.task('clean', ['copy-public'], function () {
    console.log('to clean ...');
    return gulp.src(['build/public/default/assets/css/*/*.css', 'build/public/default/assets/js/*/*.js'])
        .pipe(clean());
});

gulp.task('copy-views', ['clean'], function () {
    console.log('to copy-views ...');
    return gulp.src(['views/**', 'package.json'], {
            base: '.'
        })
        .pipe(gulp.dest('build'));
});

gulp.task('css-rev', ['copy-views'], function () {
    console.log('to css-rev ...');
    return gulp.src('public/default/assets/css/*/*.css', {
            base: 'public'
        })
        .pipe(rev())
        .pipe(gulp.dest('build/public')) // copy original assets to build dir 
        // .pipe(gulp.dest('build')) // write rev'd assets to build dir 
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/public/css'));
});

// gulp.task('css', ['css-rev'], function () {
//     console.log('to css ...');
//     return gulp.src(['build/public/rev-manifest-css.json', 'build/views/**/*.html'])
//         .pipe(revCollector())
//         .pipe(gulp.dest('build/views'));
// });

gulp.task('compressCss', ['css-rev'], function () {
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
    return gulp.src('public/default/assets/js/*/*.js', {
            base: 'public'
        })
        .pipe(rev())
        .pipe(gulp.dest('build/public')) // copy original assets to build dir  
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/public/js'));
});

gulp.task('js', ['js-rev'], function () {
    console.log('to js ...');
    return gulp.src(['build/public/**/*.json', 'build/views/**/*.html'])
        .pipe(revCollector({
            replaceReved: true, //允许替换, 已经被替换过的文件
        }))
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
            // replace(/\bpageManager\b/g, '_1'),
            // replace(/\bpageOptions\b/g, '_2'),
            // replace(/\bpageInit\b/g, '_3'),
            // replace(/\bpageInitStyle\b/g, '_4'),
            // replace(/\bpageInitEvents\b/g, '_5'),
            // replace(/\bpageInitData\b/g, '_6'),
            // replace(/\bpageSearch\b/g, '_7'),
            // replace(/\bpageGetButtons\b/g, '_8'),
            // replace(/\bpageDestroy\b/g, '_9'),
            // replace(/\bpageAddValidation\b/g, '_10'),
            minify({}),
            gulp.dest('build')
        ],
        cb
    );
});

gulp.task('compressHtml', ['compressJs'], function () {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true //压缩HTML
        // collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        // removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        // removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        // removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        // minifyJS: true, //压缩页面JS
        // minifyCSS: true //压缩页面CSS
    };
    return gulp.src('build/views/**/*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('build/views'));

});

gulp.task('compressNode', ['compressHtml'], function (cb) {
    pump([
            gulp.src(['settings.js', 'model.js', 'db.js', 'app.js', 'routes/**/*.js', 'models/**/*.js', 'util/*.js'], {
                base: '.'
            }),
            minify({}),
            gulp.dest('build')
        ],
        cb
    );
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



gulp.task('default', ['compressNode'], function () {
    // place code for your default task here
    console.log('done all ...');
});

// default - compressNode - compressHtml - compressJs-js - js-rev - compressCss -