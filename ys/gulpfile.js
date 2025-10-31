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
const replace = require("gulp-replace"); // 1. gulp-replace 불러오기

// --------------------
// 2. 환경 변수 및 경로 설정
// --------------------
const isProd = process.env.NODE_ENV === "production";

// ⭐️ 중요: 사용자님의 서버 경로 '~mihye'를 반영했습니다.
// 'http://.../~mihye/' 처럼 배포될 것이므로 '/~mihye'로 설정합니다.
const PROD_BASE_PATH = "/~mihye"; // ⭐️ 수정됨!

// 개발 서버(dist)의 루트 경로
const DEV_BASE_PATH = "/";

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
// JS 복사 (★ v1의 핵심 ★)
// --------------------
function scripts() {
    return gulp
        .src("src/js/**/*.js")
        .pipe(
            // 3. __BASE_PATH__ 문자열을 환경에 맞는 경로로 교체
            replace("__BASE_PATH__", isProd ? PROD_BASE_PATH : DEV_BASE_PATH)
        )
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.stream());
}

// --------------------
// NEW: JSON 데이터 복사
// --------------------
function copyData() {
    return gulp.src("src/data/**/*.json").pipe(gulp.dest("dist/data"));
}

// --------------------
// assets 복사 (fs 기반, 이미지 깨짐 방지)
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
// EJS → HTML (★ v1의 핵심 ★)
// --------------------
function views() {
    return (
        gulp
            .src(["src/views/**/*.ejs", "!src/views/**/_*.ejs"])
            // 4. EJS 템플릿에 'basePath' 변수 전달
            .pipe(ejs({ basePath: isProd ? PROD_BASE_PATH : DEV_BASE_PATH }, {}, { ext: ".html" }).on("error", console.error))
            .pipe(rename({ extname: ".html" }))
            .pipe(gulp.dest("dist"))
            .pipe(browserSync.stream())
    );
}

// --------------------
// dist 초기화(clean)
// --------------------
function clean() {
    return del(["dist/**", "!dist"]);
}

// --------------------
// 브라우저 동기화 및 감시
// --------------------
function serve() {
    browserSync.init({
        server: { baseDir: "dist", index: "index.html" },
        startPath: DEV_BASE_PATH // 개발 서버 시작 시 루트 경로
    });
    gulp.watch("src/scss/**/*.scss", styles);
    gulp.watch("src/js/**/*.js", scripts);
    gulp.watch("data/**/*.json", copyData).on("change", browserSync.reload);
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

// default: clean → 빌드 → serve
exports.default = gulp.series(clean, gulp.parallel(styles, scripts, copyAssets, views, copyData), serve);

// build만: clean → 빌드
exports.build = gulp.series(clean, gulp.parallel(styles, scripts, copyAssets, views, copyData));
