const gulp = require("gulp"),
    browserSync = require("browser-sync").create(),
    sass = require("gulp-sass"),
    concat = require("gulp-concat"),
    newer = require("gulp-newer"),
    imagemin = require("gulp-imagemin"),
    babel = require("gulp-babel"),
    autoprefixer = require("gulp-autoprefixer"),
    uglyify = require("gulp-uglify-es"),
    csso = require("gulp-csso"),
    del = require("del");

const app = "app/",
    dist = "dist/";

const config = {
    app: {
        html: app + "**/*.html",
        style: app + "scss/**/*.scss",
        js: app + "js/**/*.js",
        fonts: app + "fonts/**/*.*",
        img: app + "images/**/*.*",
        vendorsCss: app + "vendors-css/**/*.css",
        vendorsJs: app + "vendors-js/**/*.js"
    },
    dist: {
        html: dist,
        style: dist + "css",
        js: dist + "js/",
        fonts: dist + "fonts/",
        img: dist + "images/",
        vendorsCss: dist + "vendors-css/",
        vendorsJs: dist + "vendors-js/"
    },
    watch: {
        html: app + "**/*.html",
        style: app + "scss/**/*.scss",
        js: app + "js/**/*.js",
        fonts: app + "fonts/**/*.*",
        img: app + "images/**/*.*",
        vendorsCss: app + "vendors-css/**/*.css",
        vendorsJs: app + "vendors-js/**/*.js"
    }
};

const webserver = () => {
    browserSync.init({
        server: {
            baseDir: "dist/"
        },
        host: "localhost",
        notify: false,
    })
};

const htmlTask = () => {
    return gulp
    .src(config.app.html)
    .pipe(gulp.dest(config.dist.html))
    .pipe(browserSync(reload({stream: true})))
};

const scssTask = () => {
    return gulp
    .src(config.app.style)
    .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError))
    .pipe(concat("main.min.css"))
    .pipe (
        autoprefixer({
            overrideBrowserlist: ["last 10 version"],
            grid: true
        })
    )
    .pipe(gulp.dest(config.dist.style))
    .pipe(browserSync(reload({stream: true})))
};

const vendorCssTask = () => {
    return gulp
    .src(config.app.vendorsCss)
    .pipe(concat("vendors.min.css"))
    .pipe(csso())
    .pipe(gulp.dest(config.dist.style))
    .pipe(browserSync(reload({stream: true})))
};

const jsTask = () => {
    return gulp
    .src(config.app.js)
    .pipe (
        babel({
            presets: ["@babel/prest-env"]
        })
    )
    .pipe(uglyify())
    .pipe(gulp.dest(config.dist.js))
    .pipe(browserSync(reload({stream: true})))
}

const vendorJsTask = () => {
    return gulp
    .src(config.app.vendorsJs)
    .pipe(concat("vendors.min.js"))
    .pipe(uglyify())
    .pipe(gulp.dest(config.dist.style))
    .pipe(browserSync(reload({stream: true})))
};

const imgTask = () => {
    return gulp
    .src(config.app.img)
    .pipe(newer(config.dist.img))
    .pipe(
        imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [{removeViewBox: true},{cleanupIDs: false}]
            })
        ])
    )
    .pipe(gulp.dest(config.dist.img))
    .pipe(browserSync(reload({stream: true})))
};

const fontsTask = () => {
    return gulp
    .src(config.app.fonts)
    .pipe(gulp.dest(config.dist.fonts))
    .pipe(browserSync(reload({stream: true})))
}

const cleanDist = () => {
    return del("dist")
};

const watchFiles = () => {
    gulp.watch([config.watch.html], gulp.series(htmlTask))
    gulp.watch([config.watch.style], gulp.series(scssTask))
    gulp.watch([config.watch.js], gulp.series(jsTask))
    gulp.watch([config.watch.vendorsCss], gulp.series(vendorCssTask))
    gulp.watch([config.watch.vendorsJs], gulp.series(vendorJsTask))
    gulp.watch([config.watch.img], gulp.series(imgTask))
    gulp.watch([config.watch.fonts], gulp.series(fontsTask))
}

const start = gulp.series(
    htmlTask,
    scssTask,
    jsTask,
    vendorCssTask,
    vendorJsTask,
    imgTask,
    fontsTask
);

exports.default = gulp.parallel(start, watchFiles, webserver);

exports.build = gulp.series(
    cleanDist,
    htmlTask,
    scssTask,
    jsTask,
    vendorCssTask,
    vendorJsTask,
    imgTask,
    fontsTask
)