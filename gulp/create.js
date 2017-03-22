var gulp         = require('gulp');
var clean        = require('gulp-clean');
var concat       = require('gulp-concat');
var streamqueue   = require('streamqueue');
var symlink = require('gulp-sym')

var config = require('./config');
var helper = require('./helper');

gulp.task('dev.link.app', function() {
    var linksrc = [config.getAppSrcDir()];
    var linkdest = [config.getAppDevDir() + '/src/apps/' + config.getAppConfig().dir];
    if(config.getAppScripts().otherapps) {
        var otherappsConfig = config.getAppScripts().otherapps;
        for (var i = 0; i < otherappsConfig.length; i++) {
            linksrc.push(config.getAppSrcDir()+'/../'+otherappsConfig[i].app);
            linkdest.push(config.getAppDevDir() + '/src/apps/' + otherappsConfig[i].app);
        }
    }
    return gulp.src(linksrc)
        .pipe(symlink(linkdest));
});

gulp.task('dev.link.lib', function() {
    return gulp.src(config.getData().dir.src + '/script')
        .pipe(symlink(config.getAppDevDir() + '/src/script/'));
});

gulp.task('dev.link.templates', function() {
    return gulp.src(config.getData().dir.src + '/template')
        .pipe(symlink(config.getAppDevDir() + '/template/'));
});

gulp.task('dev.link.vendor', function() {
    return gulp.src(config.getData().dir.vendor)
        .pipe(symlink(config.getAppDevDir() + '/node_modules'));
});

gulp.task('dev.template', function() {
    var sq = streamqueue({objectMode:true});
    var tplFiles = config.getAppTemplates();
    sq = helper.templates(sq, tplFiles);

    return sq
        .done()
        .pipe(concat('templates.js'))
        .pipe(gulp.dest(config.getAppDevDir() + '/src/zconfig/'));
});

gulp.task('dev.clean.all', function() {
    return gulp.src([
        config.getAppDevDir(),
        config.getAppDevDir() + '/.htaccess',
        '!' + config.getAppDevDir() + '/.gitignore'
    ]).pipe(clean({force: true}));
});

gulp.task('dev.create', ['dev.clean.all'], function() {
    return gulp
        .start('dev.link.app')
        .start('dev.link.lib')
        .start('dev.link.templates')
        .start('dev.link.vendor')
        .src(config.getData().dir.src + '/.htaccess')
        .pipe(gulp.dest(config.getAppDevDir()))
});