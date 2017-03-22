var extend   = require('util')._extend;
var gulpif   = require('gulp-if');
var uglify   = require('gulp-uglify');
var minimist = require('minimist');
var util     = require('gulp-util');

var config = require('./configData');
// util.log(config);

var knownOptions = {
  string : 'app',
  default: { app: 'app' }
};
var options = minimist(process.argv.slice(2), knownOptions);

module.exports = {
    getData         : getConfigData,
    getVendorJs     : getVendorJs,
    getVendorCss    : getVendorCss,
    getTheme        : getTheme,
    getLess         : getLess,
    getImage        : getImage,
    getPosters      : getPosters,
    getCopyFiles    : getCopyFiles,
    getIndex        : getIndex,
    getConfigReplace: getConfigReplace,
    getIndexReplace : getIndexReplace,

    getAppConfig   : getAppConfig,
    getAppSrcDir   : getAppSrcDir,
    getAppDevDir   : getAppDevDir,
    getAppDistDir  : getAppDestDir,
    getAppTemplates: getAppTemplates,
    getAppScripts  : getAppScripts
};

function getConfigData() {
    return config;
}

function getVendorJs() {
    return getAppConfig().vendorJs;
}

function getVendorCss() {
    return getAppConfig().vendorCss;
}

function getLess() {
    return getAppConfig().less;
}

function getTheme() {
    return getAppConfig().theme;
}

function getImage() {
    var appImages = getAppConfig()['image'] ? getAppConfig()['image'] : {src: '', dist: ''};
    return appImages;
}

function getPosters() {
    var appPosters = getAppConfig()['posters'] ? getAppConfig()['posters'] : {src: '', root: ''};
    return appPosters;
}

function getCopyFiles() {
    return getAppConfig().copyFiles;
}

function getIndex() {
    return getAppConfig().index;
}

/**
 * @TODO 没有实现dev和release区分
 */
function getConfigReplace(options) {
    return getAppConfig().configReplace;
}

/**
 * @TODO 没有实现dev和release区分
 */
function getIndexReplace(optios) {
    return getAppConfig().indexReplace;
}

function getAppConfig() {
    return config.apps[options.app];
}

function getAppSrcDir() {
    return config.dir.src + '/apps/' + getAppConfig().dir;
}

function getAppDevDir() {
    return config.dir.dev + '/' + getAppConfig().dir;
}

function getAppDestDir() {
    return config.dir.dest + '/' + getAppConfig().dir;
}

function getAppTemplates() {
    return getAppConfig().templateFiles;
}

function getAppScripts(addDevScript) {
    var scripts = extend({}, getAppConfig().scriptFiles);
    if(addDevScript) {
        scripts.src.push(getAppDevDir() + '/js/**/*.js')
    }
    return scripts;
}
