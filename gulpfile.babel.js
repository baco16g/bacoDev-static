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
	pugIndex: ['src/html/index.pug'],
	pugPages: ['src/html/pages/**/*.pug', '!src/html/pages/**/_*.pug'],
	sass: ['src/sass/**/*.scss', '!src/sass/**/_*.scss'],
	babel: ['src/js/**/*.js', '!src/js/**/_*.js', '!src/js/vendor/*.js'],
	jsVendor: ['src/js/vendor/*.js'],
	img: 'src/images/**/*.{png,jpg,gif,svg}',

	// Dest
	htmlDest: 'public',
	cssDest: 'public/assets/css',
	jsDest: 'public/assets/js',
	imgDest: 'public/assets/images',

};

// ==========================================================================
// Task function
// ==========================================================================

// HtmlIndex
function htmlIndex() {
	return gulp.src(paths.pugIndex)
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
	.pipe(gulp.dest(paths.htmlDest));
}

// htmlPages
function htmlPages() {
	return gulp.src(paths.pugPages)
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
	.pipe(gulp.dest(paths.htmlDest));
}

// Sass compile
function css() {
	return gulp.src(paths.sass)
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
	return gulp.src(paths.babel)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.babel())
	.pipe($.uglify())
	.pipe(gulp.dest(paths.jsDest));
}

function jsVendor() {
	return gulp.src(paths.jsVendor)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.concat('vendor.js'))
	.pipe($.uglify())
	.pipe(gulp.dest(paths.jsDest));
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
	gulp.watch(paths.pug, gulp.series(htmlIndex));
	gulp.watch(paths.pug, gulp.series(htmlPages));
	gulp.watch(paths.sass, gulp.series(css));
	gulp.watch(paths.img, gulp.series(img));
	gulp.watch(paths.babel, gulp.series(jsMain));
	gulp.watch(paths.jsVendor, gulp.series(jsVendor));
	done();
});

// Default Build
gulp.task('build', gulp.series(
	clean,
	htmlIndex,
	htmlPages,
	gulp.parallel(css, img, jsMain, jsVendor),
	bs,
));

// Default Build
gulp.task('default', gulp.series('build', 'watch'));
