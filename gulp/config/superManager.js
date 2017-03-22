var dir    = require('./dir');
var common = require('./common');

module.exports = {
	dir: 'superManager',

	theme: 'blue',

	less: {
		src: [
			dir.app + '/superManager/less/*.less',
			dir.src + '/less/**/*.less'
		],
        index: dir.src + '/less/app.less'
	},

	injectLess: [
		dir.app + '/superManager/less/theme.less',
		dir.app + '/superManager/less/sidebar.less'
	],
	image: {
        src: [
        	dir.src + '/apps/superManager/image/**/*.*',
        	dir.src + '/image/**/*.*'
        ]
    },
	vendorJs: {
		src: [
            dir.vendor + '/angular/angular.js',
            dir.vendor + '/angular-ui-router/release/angular-ui-router.js',
            dir.vendor + '/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
            dir.vendor + '/angular-sanitize/angular-sanitize.js',
            dir.vendor + '/angular-cookies/angular-cookies.js',
            dir.vendor + '/angular-animate/angular-animate.js',
            dir.vendor + '/angular-clipboard/angular-clipboard.js',
            dir.vendor + '/qrcode-generator/js/qrcode.js',
            dir.vendor + '/angular-qrcode/angular-qrcode.js',
			dir.vendor + '/angular-clipboard/angular-clipboard.js',
		],
		dist: 'vendor.js'
	},

	vendorCss: {
		src: [
			dir.vendor + '/font-awesome/css/font-awesome.css',
			dir.src + '/script/walletpop/css/walletpop.css',
		],
		dist: 'vendor.css'
	},

	templateFiles: [
		{
            src: dir.src + '/script/system/**/*.tpl.html',
            root: '/src/script/system'
		}, {
            src: dir.src + '/script/ui/**/*.tpl.html',
            root: '/src/script/ui'
        }, {
            src: dir.src + '/script/shop/**/*.tpl.html',
            root: '/src/script/shop'
        },{
        	src: dir.src + '/script/user/**/*.tpl.html',
        	root: '/src/script/user'
        },{
			src: [
				dir.src + '/template/**/*.tpl.html',
				dir.src + '/apps/superManager/template/**/*.tpl.html'
			],
			root: '/template'
		}
	],

	scriptFiles: {
		src: [
            dir.src + '/script/ui/layout/**/*.js',
			dir.src + '/script/ui/util.js',
			dir.src + '/script/ui/steps.js',
			dir.src + '/script/ui/menu/menu.js',
			dir.src + '/script/ui/list/*.js',
            dir.src + '/script/system/**/*.js',
            dir.src + '/script/shop/**/*.js',
            dir.src + '/script/task/**.js',
            dir.src + '/script/user/**/*.js',
            dir.src + '/script/service/**/*.js',
            dir.src + '/script/product/resource/**.js',
            dir.src + '/script/directive/**/*.js',
			dir.app + '/superManager/script/**/*.js',
		],
		otherapps: [
		],
		dist: 'index.js'
	},
	copyFiles: [
        {
            src: dir.src + '/fonts/*',
            base: dir.src + '/'
        }, {
            src: dir.src + '/.htaccess',
            base: dir.src
        }, {
            src: dir.src + '/script/layer/**/*',
            base: dir.src+'/script/'
        }, {
			src: dir.src + '/script/walletpop/**/*',
			base: dir.src+'/script/'
		}
    ],

	configReplace: {
		dev: {
            patterns: [

                {match: 'apiGateway', replacement: 'http://cloudapi.yoloke.com'},
                {match: 'appBaseUrl', replacement: 'http://super.7ingu.com'},
                {match: 'activityUrl', replacement: 'http://kjbb.ews.m.jaeapp.com'},
                {match: 'appName', replacement: '美单'}
            ]
		},
		release: {
            patterns: [
                {match: 'apiGateway', replacement: 'http://meidan.hz.taeapp.com/api.php'},
                {match: 'appBaseUrl', replacement: 'http://super.7ingu.com'},
                {match: 'activityUrl', replacement: 'http://meidanb.ews.m.jaeapp.com'},
                {match: 'appName', replacement: '美单'}
            ]
		}
	},

	indexReplace: {
		dev: {
            patterns: [
                {match: 'webRoot', replacement: ''},
                {match: 'appName', replacement: '美单'},
                {match: 'bodyContent', replacement: ''},
                {match: 'headContent', replacement: ''}
            ]
		},
		release: {
            patterns: [
                {match: 'webRoot', replacement: ''},
                {match: 'appName', replacement: '美单'},
                {match: 'bodyContent', replacement: ''},
                {match: 'headContent', replacement: ''}
            ]
		}
	},

	index: {
		src: dir.src + '/index.html',
		dist: 'index.html'
	}
};
