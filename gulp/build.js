const gulp = require('gulp');
const connect = require('gulp-connect');
const mustache = require('gulp-mustache');
const { getManifest } = require('./revision');
require('./static');
require('./bundle');
require('./webpack');

const getConfig = prefix => ({
    index: `<script src="js/${prefix ? getManifest(`index${prefix}.js`) : 'index.js'}"></script>`,
    bot: `<script src="js/${prefix ? getManifest(`bot${prefix}.js`) : 'bot.js'}"></script>`,
    bundle: `<script src="js/bundle.js"></script>`,
    // bot_css: `<link href="css/${getManifest('bot.css')}" rel="stylesheet" />`,
});

const genHtml = min =>
    gulp
        .src('templates/*.mustache')
        .pipe(mustache({}, { extension: '.html' }, getConfig(min === true ? '.min' : '')))
        .pipe(gulp.dest('./www'))
        .pipe(connect.reload());

gulp.task(
    'build-dev-html',
    gulp.series(done => {
        genHtml(false);
        done();
    })
);

gulp.task(
    'build-dev-js',
    gulp.series('webpack-dev', done => {
        genHtml(false);
        done();
    })
);

gulp.task(
    'build-dev-static',
    gulp.series('static', done => {
        genHtml(false);
        done();
    })
);

gulp.task(
    'build-min',
    gulp.series('static', 'webpack-prod', 'bundle-js', 'pull-blockly-translations', done => {
        genHtml(true);
        done();
    })
);

gulp.task('build', gulp.parallel('bundle-js', 'build-dev-js', 'build-dev-static', 'pull-blockly-translations'));
