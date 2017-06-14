// 由于这个文件是学习gulp的时候使用的,所以gulp任务有太多注释,以及有部分gulp是无用的.
//
let gulp = require('gulp');
let less = require('gulp-less'); //
let minicss = require("gulp-clean-css");
let rename = require("gulp-rename");
let browserSync = require('browser-sync').create();


// 文件路径
let lessPath = "web/**/*.less"; // 需要装换less路径,是全部转换less的位置;若是哪个修改转换哪个,位置在修改的那个less所在文件夹
let less2cssPath = "web/"; // less装换css后存放路径
let cssPath = ["web/**/*.css", "!web/**/*.min.css"]; // 需要压缩的css路径
let css2miniPath = "web/"; // 压缩后的css路径

let browserSyncPath = ["web/**/*.html", "web/**/*.js", "web/**/*.css"]; // 监视同步路径
let browserSyncWithoutCssPath = ["web/**/*.html", "web/**/*.js"]; // 监视路径不要css
let browserSyncRootPath = "./web"; //服务器根目录
let browserSyncIndex = "index.html"; // 服务器启动的时候,默认打开的文件


/**
 * globs 采用 node-glob 语法
 *
 * ! 不匹配
 * * 任意文件
 * ** 任意文件夹
 * {} 类似正则的分组 src/{index,layout}.less 会 拆分为"src/index.less","src/layout.less" 即{index,layout}有点类似/(index)|(layout)/g
 */

gulp.task('default', ["less", "syncLess2"], function() {
    console.log("********\n执行了 less & syncLess2\n********");
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


// 正式
gulp.task("less", function() {
    gulp.src(lessPath).pipe(less()).pipe(gulp.dest(less2cssPath)); //其实用lessFn(lessPath,less2cssPath) 也行
});

// 自动编译less
gulp.task("autoLess", function() {
    gulp.watch(lessPath, ['less']) // 后面的任务不要是监视任务,是一次性任务(任务里面没有watch),否则就会出现好多重监视
        .on('change', function(event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
});


// 这个是只会去转换修改的那个文件 , 而不会转换全部less , 减少性能消耗. 考拉就是单个装换
function lessFn(path, destPath) { // 只有path是event.path的时候才可以忽略destPath
    let path_separator = path.includes("\\") ? "\\" : "/"; // 路径分隔符 windows 是"\" , linux是"/"
    let pathArr = path.split(path_separator);
    let arrLen = pathArr.length;
    let removeIndex = -1; //删除数组的下标
    if (pathArr[arrLen - 1] == "") { //因为如果是文件夹的话是以\结尾 , 那么数组的最后一个就为 ""
        removeIndex = -2;
    }
    destPath = destPath || pathArr.slice(0, removeIndex).join("/"); //如果path是event.path,写入文件路径就是被读取文件的当前文件夹
    //如果path是event.path,写入文件路径就是被读取文件的当前文件夹
    // 但是由于watch的路径是含有 **/的话 ,新建文件夹也会触发,path----D:\learnGulp\web\css\新建文件夹\ destPath---D:/learnGulp/web/css/新建文件夹 那么就会把"新建文件夹"放在 D:/learnGulp/web/css/新建文件夹 就会无限建文件夹
    // 所以要判断path是否以 "/" 结尾
    return gulp.src(path).pipe(less()).pipe(gulp.dest(destPath)); // 返回流,调用后在返回值后面再流的操作
}
gulp.task("autoOneLess", function() {
    gulp.watch(lessPath)
        .on('change', function(event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
            lessFn(event.path);
        });
});
// 单个转换也有弊端 , 就是如果有个 基础less , 其他每个less都引入了;这是只修改了

// 对于path也是一个问题
// gulp.src(path)采用的是**/任意文件夹写法 比如web/**/*.css 读取到的文件假设是 web/css/layout/index.css 其中**/就是对应css/layout/中间的路径 , 所以gulp.dest()写入的时候也会补上这个路径
// 但是如果是采用了event.path就会具体到某个文件,相当于是*.css,在gulp.dest()写入的时候是不会不会补上中间路径
//假设读取文件的路径为 web/css/layout/index.css   采用 gulp.src("web/**/*.css").pipe(gulp.dest("new/"))            的话  写入的文件路径为new/css/layout/index.css
//                                                采用 gulp.src("web/css/layout/index.css").pipe(gulp.dest("new/"))的话  写入的文件路径为           new/index.css
//
// gulp.task("test",function(){
//     gulp.src("web/**/testPath.css").pipe(gulp.dest("new/")); //写入文件的路径D:\learnGulp\new\css\layout\testPath.css
//     // gulp.src("web/css/layout/testPath.css").pipe(gulp.dest("new/"));写入文件的路径 D:\learnGulp\new\testPath.css 就缺少了**/匹配到的\css\layout
// });
// 因此我们要通过watch的path和event.path 去修改对应的destPath



















/**
 * 压缩css
 */

// minicss
gulp.task("minicss", function() {
    gulp.src(cssPath).pipe(minicss()).pipe(rename({ suffix: '.min' })).pipe(gulp.dest(css2miniPath));
});

// less & minicss
gulp.task("lessmini", function() {
    gulp.src(lessPath)
        .pipe(less())
        .pipe(gulp.dest(less2cssPath))
        .pipe(minicss())
        .pipe(rename({ suffix: '.min' })) //重命名
        .pipe(gulp.dest(css2miniPath));
});

// 自动 less & minicss 一般没有什么必要 因为只有每天结束提交的时候才需要压缩css
gulp.task("autoLessmini", function() {
    gulp.watch(lessPath, ['lessmini'])
        .on('change', function(event) {
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

// 只根据某个(些)文件更新
let reload = browserSync.reload;
let syncFilePath = "index.html";
gulp.task('syncFile', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(syncFilePath).on("change", reload);
});

// 浏览器同步
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: browserSyncRootPath,
            index: browserSyncIndex
        }
    });
    gulp.watch(browserSyncPath).on("change", function(event) {
        console.log(event.path);
        gulp.src(event.path).pipe(browserSync.reload({ stream: true }));
    });
});
// browser-sync start --server --files "**/*.html,**/*.css,**/*.js"   browser-sync 不用gulp grunt等构造工具直接使用写法;
// 若用gulp去监视全部html,js,css文件 启动会十分慢(只要是由于"node_modules/"中大量文件) 甚至报错 所以还是监视指定文件夹里面的html,js,css,less(只要是少量文件会比browser-sync直接使用启动快好多);
// 所以以后那些资源文件(或者所在文件夹)都不要放在根目录 可以找个文件夹装着 比如web/ web/*.html web/css/*.css web/js/*.js

// 就算是忽略列表也不能太大 , 否则也会慢 即使["*.html","!node_modules/**/*.html"] 也会比 "*.html" 慢好多 , 虽然忽略列表可以不写 , 所以还不要尝试去检测全部html,js,css文件变化(即使忽略了node_modules/目录也慢);例子如下
// gulp.task('testSpeed', function() {
//     browserSync.init({
//         server: {
//             baseDir: "./"
//         }
//     });
//     // gulp.watch(["index.html"]).on("change", reload); // 启动17ms
//     gulp.watch(["index.html", "!node_modules/**.html"]).on("change", reload); // 启动8.24s
// });













/**
 * 监视同时转换less
 */
// 方式1 实际监视的是css , 只是less转换的时候触发css变化(可能不能用全部转换方法,只能用哪个less变化就装换哪个)
gulp.task('syncLess', function() {
    browserSync.init({
        server: {
            baseDir: browserSyncRootPath,
            index: browserSyncIndex
        }
    });

    // 转换less
    gulp.watch(lessPath).on('change', function(event) {
        lessFn(event.path);
    });
    // 监视文件变化同步浏览器
    gulp.watch(browserSyncPath).on("change", function(event) {
        gulp.src(event.path).pipe(browserSync.reload({ stream: true }));
    });
});

// 方式2 监视的是less , 转换后 reload
gulp.task('syncLess2', function() {
    browserSync.init({
        server: {
            baseDir: browserSyncRootPath,
            index: browserSyncIndex
        }
    });
    // 转换less 并刷新
    gulp.watch(lessPath).on('change', function(event) {
        synclessFn(event.path);
    });
    // 监视文件变化同步浏览器
    gulp.watch(browserSyncWithoutCssPath).on("change", function(event) {
        gulp.src(event.path).pipe(browserSync.reload({ stream: true }));
    });
});

function synclessFn(path) {
    lessFn(path).pipe(browserSync.reload({ stream: true }));
}
