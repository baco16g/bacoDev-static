import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import browserSync from 'browser-sync';
import pagespeed from 'psi';
import pngquant from 'imagemin-pngquant';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Paths
const paths = {
	// Source
	pug: 'src/**/*.pug',
	sass: 'src/assets/sass/**/*.scss',
	babel: 'src/assets/js/**/*.js',
	img: 'src/assets/images/**/*.{png,jpg,gif,svg}',

	// Dest
	htmlDest: 'public',
	cssDest: 'public/assets/css',
	jsDest: 'public/assets/js',
	imgDest: 'public/assets/images',

};

// ==========================================================================
// Task function
// ==========================================================================

// HTML
function html() {
	return gulp.src(paths.pug)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
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
function js() {
	return gulp.src(paths.babel)
	.pipe($.plumber({ errorHandler: $.notify.onError('<%= error.message %>') }))
	.pipe($.babel())
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
	gulp.watch(paths.pug, gulp.series(html));
	gulp.watch(paths.sass, gulp.series(css));
	gulp.watch(paths.img, gulp.series(img));
	gulp.watch(paths.babel, gulp.series(js));
	done();
});

// Default Build
gulp.task('build', gulp.series(
	clean,
	html,
	gulp.parallel(css, img, js),
	bs,
));

// Default Build
gulp.task('default', gulp.series('build', 'watch'));
