var gulp          = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var minifyHtml    = require("gulp-minify-html");
var config        = require('./config');
var inject        = require('gulp-inject');

module.exports = {
	templates          : templates,
	lessInjectTransform: lessInjectTransform
};

function templates(sq, templates) {
    for(i in templates) {
        var template = templates[i];
        sq.queue(
            gulp.src(template.src)
                .pipe(minifyHtml({
                    empty: true,
                    spare: true,
                    quotes: true
                }))
                .pipe(templateCache('template.js', {
                    module: 'app',
                    root: template.root
                }))
        );
    }
	return sq;
}

function lessInjectTransform(filepath) {
    if (filepath.slice(-5) === '.less') {
      return '<link rel="stylesheet/less" type="text/css" href="'+filepath+'" />';
    }
    return inject.transform.apply(inject.transform, arguments);
}
