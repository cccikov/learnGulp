let gulp = require('gulp');
let less = require('gulp-less');//
let minicss = require("gulp-clean-css");


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


function lessFn(path){
    gulp.src(path).pipe(less()).pipe(gulp.dest("lib/css"));
}
// 这个是只会去装换修改的那个文件 , 而不会全部去修改
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
