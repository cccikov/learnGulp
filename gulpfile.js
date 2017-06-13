let gulp = require('gulp');
let less = require('gulp-less'); //
let minicss = require("gulp-clean-css");
let browserSync = require('browser-sync').create();


/**
 * globs 采用 node-glob 语法
 *
 * ! 不匹配
 * * 任意文件
 * ** 任意文件夹
 * {} 类似正则的分组 src/{index,layout}.less 会 拆分为"src/index.less","src/layout.less" 即{index,layout}有点类似/(index)|(layout)/g
 */

gulp.task('default', ["lessmini"], function() {
    console.log("********\n执行了 less & mini\n********");
});

gulp.task('auto', ["autoOneLess"], function() {
    console.log("********\n执行了 autoLess\n********");
});



/**
 * 转换less
 */

// 编译单个less
gulp.task("indexLess", function() {
    gulp.src("src/index.less").pipe(less()).pipe(gulp.dest("lib/css"))
});

// 编译多个less
gulp.task("someLess", function() {
    // gulp.src(["src/index.less","src/layout.less"]).pipe(less()).pipe(gulp.dest("lib/css"))
    gulp.src("src/{index,layout}.less").pipe(less()).pipe(gulp.dest("lib/css"))
});

gulp.task("less", function() {
    gulp.src("src/**/*.less").pipe(less()).pipe(gulp.dest("lib/css"));
});

// 自动编译less
gulp.task("autoLess", function() {
    gulp.watch("src/**/*.less", ['less']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});


function lessFn(path) {
    gulp.src(path).pipe(less()).pipe(gulp.dest("lib/css"));
}
// 这个是只会去转换修改的那个文件 , 而不会转换全部less , 减少性能消耗
gulp.task("autoOneLess", function() {
    gulp.watch("src/**/*.less").on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        lessFn(event.path);
    });
});


/**
 * 压缩css
 */

// minicss
gulp.task("minicss", function() {
    gulp.src("lib/css/*.css").pipe(minicss()).pipe(gulp.dest("lib/css"));
});

// less & minicss
gulp.task("lessmini", function() {
    gulp.src("src/**/*.less")
        .pipe(less())
        .pipe(minicss())
        .pipe(gulp.dest("lib/css"));
});

// 自动 less & minicss 一般没有什么必要 因为只有每天结束提交的时候才需要压缩css
gulp.task("autoLessmini", function() {
    gulp.watch("src/**/*.less", ['lessmini']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});


/**
 * browser-sync
 */

// 静态服务器
gulp.task('server', function() {
    browserSync.init({
        /*server: {
            baseDir: "./",// 指定服务器的根目录
            index:"test.html"// 指定服务器启动的时候,默认打开的文件
        }*/
        server: "./" // 等于server: {baseDir: "./"}
    });
});


// 只根据html文件更新
let reload = browserSync.reload;
gulp.task('syncHtml', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch("index.html").on("change", reload);
});

//
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(["**/*.html","**/*.js","**/*.css","!node_modules/**/*.*"]).on("change", function(event){
        console.log(event.path)
        gulp.src(event.path).pipe(browserSync.reload({stream:true}));
    });
});


// 静态服务器 + 监听 scss/html 文件
gulp.task('test', ['some'], function() {
    browserSync.init({
        server: "./"
    });

    gulp.watch("**/*.less", ['some']);
    gulp.watch("**/*.html").on('change', reload);
});

gulp.task('some', function () {
    gulp.src('**/*.less')
        .pipe(less())
        .pipe(gulp.dest('lib/css'))// Write the CSS & Source maps
        .pipe(browserSync.reload({stream:true}));
});