var gulp         = require('gulp');
var less         = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var inject       = require('gulp-inject');
var replace      = require('gulp-replace-task');
var merge        = require('merge-stream');
var streamqueue   = require('streamqueue');
var clean        = require('gulp-clean');
var image         = require('gulp-image');

var config = require('./config');
var helper = require('./helper');

//================= dev =========================
gulp.task('dev.less', function() {
    if(!config.getLess() || !config.getLess().src) {
        return ;
    }
    
    return gulp.src(config.getLess().src)
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(concat('style.css'))
        .pipe(gulp.dest(config.getAppDevDir() + '/css'));
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

gulp.task('dev.config', function() {
    return gulp.src(config.getAppSrcDir() + '/script/local.config.js.dist')
        .pipe(replace(config.getAppConfig().configReplace.dev))
        .pipe(concat('local.config.js'))
        .pipe(gulp.dest(config.getAppDevDir() + '/src/zconfig/'));
});

gulp.task('dev.copy', function() {
    var sq = streamqueue({objectMode:true});
    var files = config.getCopyFiles();
    for(i in files) {
        var file = files[i];
        sq.queue(
            gulp.src(file.src, {base: file.base})
                .pipe(gulp.dest(config.getAppDevDir()))
        );
    }
    return sq.done()
        .pipe(gulp.src([]))
        .pipe(gulp.dest(config.getAppDevDir()));
});

gulp.task('dev.theme', function(){
    if(!config.getTheme()) {
        return ;
    }
    var variableStream = gulp.src(['src/theme/variables/'+config.getTheme()+'.less'])
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(concat('variables.css'));
    var themeStream = gulp.src(['src/theme/'+config.getTheme()+'.min.css'])
        .pipe(autoprefixer())
        .pipe(concat('theme.css'));

    return merge(variableStream, themeStream)
        .pipe(concat('apptheme.css'))
        .pipe(gulp.dest(config.getAppDevDir()+'/theme'));
});

gulp.task('dev.clean.build', function() {
    var src = [
        config.getAppDevDir() + '/src/zconfig/',
        config.getAppDevDir() + '/css'
    ];
    return gulp.src(src).pipe(clean({force: true}));
});
gulp.task('dev.image', function(){
    // return gulp.src(config.getImage().src)
    //     .pipe(image())
    //     .pipe(gulp.dest(config.getAppDevDir() + '/image'));
});

gulp.task('dev.index', ['dev.config', 'dev.template', 'dev.less', 'dev.theme', 'dev.image'], function() {
    var devDir = config.getAppDevDir();
    var scripts = config.getAppScripts().src;
    scripts.push(devDir + '/src/zconfig/*.js');
    
    return gulp.src(config.getIndex().src)
        .pipe(inject(
            gulp.src(config.getVendorJs().src, {read: false}),
            {name:'vendorJs'}
        ))
        .pipe(inject(
            gulp.src(config.getAppConfig().injectLess, {read:false}),
            {name:'theme', transform: helper.lessInjectTransform}
        ))
        .pipe(inject(gulp.src(config.getVendorCss().src, {read: false}), {name:'vendorCss'}))
        .pipe(inject(gulp.src(scripts, {read: false}), {ignorePath: '/dev/' + config.getAppConfig().dir, name:'app'}))
        .pipe(inject(gulp.src('src/theme/apptheme.css', {read: false}), {ignorePath: 'src/', name: 'apptheme'}))
        .pipe(inject(gulp.src(devDir + '/css/*.css', {read:false}), {ignorePath: '/dev/' + config.getAppConfig().dir, name:'style'}))
        .pipe(replace(config.getIndexReplace().dev))
        .pipe(concat(config.getIndex().dist))
        .pipe(gulp.dest(config.getAppDevDir()));
});

gulp.task('dev', ['dev.clean.build'], function() {
    gulp.start('dev.index');
});

//==================== release =======================

gulp.task('release.less2css', function() {
	return gulp
		.src(config.getLess().src)
		.pipe(less())
		.pipe(autoprefixer())
		.pipe(concat('style.css'))
		.pipe(gulp.dest(config.getAppDistDir() + '/css'))
	;
});

gulp.task('release.injectLess', function() {
	return gulp
		.src(config.getAppConfig().injectLess)
		.pipe(concat('theme.less'))
		.pipe(gulp.dest(config.getAppDistDir() + '/less'))
	;
});

gulp.task('release', ['release.clean'], function() {
    gulp
        .start('release.vendor.script')
		.start('release.less2css')
		.start('release.injectLess')
        .start('release.script')
        .start('release.config')
        .start('release.processhtml')
	;
});
