let gulp = require('gulp');
let less = require('gulp-less');


/**
 * globs 采用 node-glob 语法
 *
 * ! 不匹配
 * * 任意文件
 * ** 任意文件夹
 * {} 类似正则的分组 src/{index,layout}.less 会 拆分为"src/index.less","src/layout.less" 即{index,layout}有点类似/(index)|(layout)/g
 */

gulp.task('default', function() {
    // 将你的默认的任务代码放在这
    console.log("haha");
});

// 编译单个less
gulp.task("indexLess", function() {
    gulp.src("src/index.less").pipe(less()).pipe(gulp.dest("lib/css"))
});

// 编译多个less
gulp.task("someLess", function() {
    // gulp.src(["src/index.less","src/layout.less"]).pipe(less()).pipe(gulp.dest("lib/css"))
    gulp.src("src/{index,layout}.less").pipe(less()).pipe(gulp.dest("lib/css"))
});

gulp.task("allLess", function() {
    // gulp.src(["src/index.less","src/layout.less"]).pipe(less()).pipe(gulp.dest("lib/css"))
    gulp.src("src/**/*.less").pipe(less()).pipe(gulp.dest("lib/css"))
});

// 自动编译less
gulp.task("autoLess", function() {
    gulp.watch("src/**/*.less", ['allLess']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});
