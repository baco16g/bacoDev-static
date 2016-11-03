import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import fs from 'fs';
import browserSync from 'browser-sync';
import pagespeed from 'psi';
import pngquant from 'imagemin-pngquant';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// ==========================================================================
// Pathes
// ==========================================================================

const paths = {
	// Source
	html: ['src/html/**/*.pug', '!src/html/**/_*.pug', '!src/html/pages'],
	htmlPages: ['src/html/pages/**/*.pug', '!src/html/pages/**/_*.pug'],
	css: ['src/sass/**/*.scss', '!src/sass/**/_*.scss'],
	js: ['src/js/**/*.js', '!src/js/**/_*.js', '!src/js/vendor/*.js'],
	jsVendor: ['src/js/vendor/*.js'],
	img: 'src/images/**/*.{png,jpg,gif,svg}',

	// Dest
	htmlDest: 'public',
	cssDest: 'public/assets/css',
	jsDest: 'public/assets/js',
	imgDest: 'public/assets/images',

	// onlyWatch
	htmlWatch: 'src/html/**/*.pug',
	cssWatch: 'src/sass/**/*.scss',
	jsWatch: 'src/js/**/*.js',
};

// ==========================================================================
// Task function
// ==========================================================================

// HtmlIndex
function html() {
	return gulp.src(paths.html)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.data(function(file){
		let dirname = './json/';
		let files = fs.readdirSync(dirname);
		let json = {};
		files.forEach(function(filename){
			json[filename.replace('.json', '')] = require(dirname + filename);
		});
		return { data: json };
	}))
	.pipe($.pug({
		pretty: true,
		basedir: __dirname + "/src",
	}))
	.pipe(gulp.dest(paths.htmlDest))
	.pipe(reload({ stream: true }));
}

// htmlPages
function htmlPages() {
	return gulp.src(paths.htmlPages)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.data(function(file){
		let dirname = './json/';
		let files = fs.readdirSync(dirname);
		let json = {};
		files.forEach(function(filename){
			json[filename.replace('.json', '')] = require(dirname + filename);
		});
		return { data: json };
	}))
	.pipe($.pug({
		pretty: true,
		basedir: __dirname + "/src",
	}))
	.pipe(gulp.dest(paths.htmlDest))
	.pipe(reload({ stream: true }));
}

// Sass compile
function css() {
	return gulp.src(paths.css)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.sass())
	.pipe($.pleeease({
		autoprefixer: ['last 2 versions'],
		minifier: true,
		mqpacker: true,
	}))
	.pipe($.size({ title: 'sass' }))
	.pipe($.concat('common.css'))
	.pipe(gulp.dest(paths.cssDest))
	.pipe(reload({ stream: true }));
}

// Js compile
function jsMain() {
	return gulp.src(paths.js)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.babel())
	.pipe($.uglify())
	.pipe(gulp.dest(paths.jsDest))
	.pipe(reload({ stream: true }));
}

function jsVendor() {
	return gulp.src(paths.jsVendor)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.concat('vendor.js'))
	.pipe($.uglify())
	.pipe(gulp.dest(paths.jsDest))
	.pipe(reload({ stream: true }));
}

// Image optimize
function img() {
	return gulp.src(paths.img, { since: gulp.lastRun(img) })
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.imagemin({
		progressive: true,
		use: [pngquant({ quality: '60-80', speed: 1 })],
	}))
	.pipe(gulp.dest(paths.imgDest))
	.pipe($.size({ title: 'img' }))
	.pipe(reload({ stream: true }));
}

// Build folder delete
function clean(cb) {
	return del(['public']).then(() => cb());
}

// Local server
function bs(cb) {
	return browserSync.init(null, {
		server: {
			baseDir: 'public',
		},
		ghostMode: false,
		notify: false,
	}, cb);
}

// ==========================================================================
// Tasks
// ==========================================================================

// Watch
gulp.task('watch', (done) => {
	gulp.watch(paths.htmlWatch, gulp.series(html, htmlPages));
	gulp.watch(paths.cssWatch, gulp.series(css));
	gulp.watch(paths.img, gulp.series(img));
	gulp.watch(paths.jsWatch, gulp.series(jsMain, jsVendor));
	done();
});

// Default Build
gulp.task('build', gulp.series(
	clean,
	html,
	htmlPages,
	gulp.parallel(css, img, jsMain, jsVendor),
	bs,
));

// Default Build
gulp.task('default', gulp.series('build', 'watch'));
