var dir = require('./dir');
module.exports = {
    // 依赖js包配置
    vendorJs: {
        src: [
            dir.vendor + '/angular/angular.js',
            dir.vendor + '/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            dir.vendor + '/angular-cookies/angular-cookies.js',
            dir.vendor + '/angular-route/angular-route.js',
            dir.vendor + '/angular-bootstrap-show-errors/src/showErrors.js'
        ],
        dist: 'vendor.js'
    },

    vendorCss: {
        src: [
            // dir.vendor + '/bootstrap/dist/css/bootstrap.css',
            // dir.vendor + '/bootstrap/dist/css/bootstrap-theme.css',
            dir.vendor + '/font-awesome/css/font-awesome.css'
        ],
        dist: 'vendor.css'
    },


    less: {
        vendor: [
            dir.vendor + '/bootstrap/less/bootstrap.less',
            dir.src + '/less/cerulean/*.less',
        ],
        src: [
            dir.src + '/less/src/**/*.less'
        ],
        index: dir.src + '/less/app.less'
    },

    copyFiles: [
        {
            src: dir.vendor + '/font-awesome/fonts/*',
            base: dir.vendor + '/font-awesome/'
        }, {
            src: dir.vendor + '/bootstrap/fonts/glyphicons-*',
            base: dir.vendor + '/bootstrap/'
        }, {
            src: dir.src + '/.htaccess',
            base: dir.src
        }
    ],

    index: {
      src: dir.src + '/index.html',
      dist: 'index.html',
    }
};
