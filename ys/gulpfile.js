// --------------------
// 패키지 import
// --------------------
const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cleanCSS = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const del = require("del");
const fs = require("fs");
const path = require("path");
const replace = require("gulp-replace");

// --------------------
// 환경 변수 설정
// --------------------
const isProd = process.env.NODE_ENV === "production";

// --------------------
// SCSS → CSS
// --------------------
function styles() {
    return gulp
        .src("src/scss/**/*.scss")
        .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
}

// --------------------
// JS 복사 (경로 수정 포함) ⭐️ 여기!
// --------------------
function scripts() {
    return gulp
        .src("src/js/**/*.js")
        .pipe(replace('"/data/', '"./data/'))
        .pipe(replace("'/data/", "'./data/"))
        .pipe(replace('"/assets/', '"./assets/'))
        .pipe(replace("'/assets/", "'./assets/"))
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.stream());
}

// --------------------
// JSON 데이터 복사
// --------------------
function copyData() {
    return gulp
        .src("src/data/**/*.json")
        .pipe(replace('"../assets/', '"./assets/'))
        .pipe(replace("'../assets/", "'./assets/"))
        .pipe(gulp.dest("dist/data"));
}
// --------------------
// assets 복사
// --------------------
function copyAssets(cb) {
    const srcDir = "src/assets";
    const destDir = "dist/assets";

    fs.mkdirSync(destDir, { recursive: true });

    function copyDir(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        entries.forEach((entry) => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    copyDir(srcDir, destDir);
    cb();
}

// --------------------
// EJS → HTML (경로 수정 포함)
// --------------------
function views() {
    return gulp
        .src(["src/views/**/*.ejs", "!src/views/**/_*.ejs"])
        .pipe(ejs({}, {}, { ext: ".html" }).on("error", console.error))
        .pipe(rename({ extname: ".html" }))
        .pipe(replace(/\.\.\/..\//g, "./"))
        .pipe(replace(/\.\.\//g, "./"))
        .pipe(gulp.dest("dist"))
        .pipe(browserSync.stream());
}

// --------------------
// dist 초기화
// --------------------
function clean() {
    return del(["dist/**", "!dist"]);
}

// --------------------
// 브라우저 동기화 및 감시
// --------------------
function serve() {
    browserSync.init({
        server: { baseDir: "dist", index: "index.html" }
    });
    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch("src/js/**/*.js", scripts);
    gulp.watch("src/data/**/*.json", copyData).on("change", browserSync.reload);
    gulp.watch("src/assets/**/*", copyAssets).on("change", browserSync.reload);
    gulp.watch("src/views/**/*.ejs", views);
}

// --------------------
// exports
// --------------------
exports.clean = clean;
exports.assets = copyAssets;
exports.styles = styles;
exports.scripts = scripts;
exports.views = views;
exports.copyData = copyData;

exports.default = gulp.series(clean, gulp.parallel(styles, scripts, copyAssets, views, copyData), serve);
exports.build = gulp.series(clean, gulp.parallel(styles, scripts, copyAssets, views, copyData));
