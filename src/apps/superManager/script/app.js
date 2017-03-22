(function(angular, undefined) {'use strict';

angular
	.module('app', [
		//dependency
		'ui.router',
		'ui.bootstrap',
		'monospaced.qrcode',
		'ngCookies',
		'system',
		'ui.layout',
		'ui.util',
		'ui.steps',
		'ui.menu',
		'ui.list',
		'sui',
		'user',
		'shop',
		'task',
		'app.services',
		'app.directives',
		'product.resource',
		//app module
		'superManager.controllers',
		//'superManager.services'
	])
    .config(Configure)
	.controller('mainCtrl', mainCtrl)
	.controller('indexCtrl', indexCtrl)
    .service('Context', Context)
    .service('oauthCallback', oauthCallback)
    .service('appInfo', AppInfo)
;

/**
 * @ngInject
 */
function Configure(
	$stateProvider,
	$urlRouterProvider,
	$httpProvider,
    layoutManagerProvider,
	apiClientProvider,
	apiInterceptorProvider,
	oauthProvider,
	appConfig,
	$locationProvider
) {
	$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('apiInterceptor');

    $urlRouterProvider.otherwise('/index');

	$stateProvider
		.state('index', {
			url: '/index',
			templateUrl: '/template/index.tpl.html',
			controller: 'indexCtrl'
		})
		.state('member', {
			url: '/member',
			templateUrl: '/template/layout.tpl.html',
			controller: 'mainCtrl',
			resolve: {
				currentShop: /* @ngInject */function(Context, $state){
					return  Context.shop();
				}
			}
		})
	;

	oauthProvider.apps    = appConfig.oauthApps;
    oauthProvider.baseUrl = appConfig.baseUrl;
    oauthProvider.oauthCallbacks.push('oauthCallback');

	apiInterceptorProvider.gateway = appConfig.gateway+ "/rest/";
    apiClientProvider.gateway = appConfig.gateway + apiClientProvider.gateway;
    layoutManagerProvider.addLayout('logined', '/template/layout.tpl.html');
}


function indexCtrl($scope, $state, auth, Shop, $window, oauth, Context, $cookies) {
	var authData = auth.getAdapter().getData();
	var sellerNick = $cookies.get('sellerNick');
	if(angular.isObject(authData) && angular.isArray(authData.bindTokens) && authData.bindTokens.length > 0) {
        Shop.query({ids: [authData.bindTokens[0]]}).then(function(datas){
            $scope.shop = datas.items[0];
            $cookies.put('sellerNick', $scope.shop.oauthInfo.nick, {path: '/'});
            if(angular.isUndefined($scope.shop)) {
            	oauth.apps().then(function(apps) {
                    $window.location.href = apps[0].authUrl;
                });
            }
            if($scope.shop.oauthInfo.expiresIn === false) {
                oauth.apps().then(function(apps) {
                    $window.location.href = apps[0].authUrl;
                });
            }
            Context.setShop($scope.shop);
            $state.go('member.promotion.promotionmisc.list')
        });
    } else {
        oauth.apps().then(function(apps) {
            $window.location.href = apps[0].authUrl;
        });
    }
}

/**
 * @ngInject
 */
function mainCtrl($scope, $state, appConfig, currentShop, Context, auth, appInfo, apiClient, oauth, $rootScope, $compile, $cookies, $timeout) {
	if(!currentShop) {
		$state.go('index');
	}
    $scope.teHui = false;
    $scope.moneyBack = false;
	$scope.appConfig = appConfig;
	$scope.currentShop = currentShop;
	var sellerNick = $cookies.get('sellerNick');
	$cookies.put('sellerNick', $scope.currentShop.oauthInfo.nick, {path: '/'});
	$scope.navLinks = [
		{href: '', icon: 'icon-touch-user3-sign', label: $scope.currentShop.oauthInfo.nick}
	];

	$rootScope.minDiscountSet = minDiscountSet;
	$rootScope.popBuyLink 	= popBuyLink;
	$scope.closePop 		= closePop;
    $scope.sureClick 		= sureClick;
    $scope.isAlert 			= isAlert;

	var authData = auth.getAdapter().getData();
	if(angular.isObject(authData) && angular.isArray(authData.bindTokens) && authData.bindTokens.length > 0) {
        if(appInfo.has('deadline')) { //没有到期
            $scope.deadline     = appInfo.get('deadline').deadlineDay;
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            $scope.deadlineDate = appInfo.get('deadline').deadline;
            pophongbao();
            register();
            if($scope.subscribeVer === 'vip1') {
                $scope.moneyBack = true;
             }
        }else{ // 已经过期
            var shopId = authData.bindTokens[0];
            apiClient.$new('shop.subscribe.get').send({shopId:shopId}).then(function(data) {
                $scope.deadline     = data.deadlineDay;
                $scope.subscribeVer = data.itemCode;
                pophongbao();
                $scope.deadlineDate = data.deadline;
                appInfo.put('deadline', data);
                register();
                if($scope.subscribeVer === 'vip1') {
                    $scope.moneyBack = true;
                 }
            });
        }
    }
	if(angular.isUndefined($scope.currentShop)) {
		Context.shop().then(function(shop){
			$scope.currentShop = shop;
		});
	}
    pophongbao();
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
	    if(toState !== fromState) {
	    	if(toState.name.indexOf('promotionmisc') !== -1) {
	    		if(toState.name.indexOf('promotionmisc.list') !== -1 || toState.name.indexOf('promotionmisc.success') !== -1) {
	    			pophongbao();
	    		}
	    	}else {
	    		if($scope.subscribeVer === 'vip0' ) {
		            $rootScope.popBuyLink('恭喜您获得一个红包', '仅需5元/月马上体验正式版！', 'http://tb.cn/6lGQlQx');
		        }else if($scope.subscribeVer==='vip1' && $scope.deadline <= 3) {
                    $rootScope.popBuyLink('恭喜您获得一个红包', '续费仅需5元/月', 'https://tb.cn/6lGQlQx');
                }else if($scope.subscribeVer==='vip2' && $scope.deadline <= 3) {
                    $rootScope.popBuyLink('恭喜您获得一个红包', '续费3个月仅需29元', 'https://tb.cn/ERbh9Gx');
                }
	    	}
	    	if(!auth.getAdapter().getData().bindTokens) {
	    		$state.go('index');
	    	}
	    }
	});
	$timeout(function(){
		auth.getAdapter().setData({});
		appInfo.removeAll();
		Context.setShop(null);
	}, 3*60*60*1000);

    function pophongbao() {
        if($scope.subscribeVer === 'vip0') {
        	$rootScope.popBuyLink('恭喜您获得一个红包', '仅需5元/月马上体验正式版！', 'http://tb.cn/6lGQlQx');
            $scope.teHui = true;
        }
        if($scope.subscribeVer==='vip1' && $scope.deadline <= 3) {
            $rootScope.popBuyLink('恭喜您获得一个红包', '续费仅需5元/月', 'https://tb.cn/6lGQlQx');
        }
        if($scope.subscribeVer==='vip2' && $scope.deadline <= 3) {
            $rootScope.popBuyLink('恭喜您获得一个红包', '续费3个月仅需29元', 'https://tb.cn/ERbh9Gx');
        }
    }

	function register() {
		var params = {
			shopId: $scope.currentShop.id,
			deadLine: $scope.deadlineDate,
			version: $scope.subscribeVer
		};
		oauth.zhikrRegister(params).then(function(){});
	}

	var modalElement;
    function minDiscountSet() {
		var html = '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
			+ '<div ng-include="\''+ '/template/activity/setMinDiscount.tpl.html' + '\'"></div>'+'</div>';
		var modalElement = angular.element(html);
		$('.page-body').after(modalElement);
		$compile(modalElement)($scope);
		$(modalElement).modal({backdrop: true});
    }
    function closePop(popHelpNeverStatus){
        $rootScope.popHelpNeverStatus = popHelpNeverStatus;
    }
    function sureClick(popHelpNeverStatus) {
        closePop(popHelpNeverStatus);
        $rootScope.sureClickCallBack();
    }

    function popBuyLink(title, subTitle, link) {
    	$.fn.walletinit({title: title, subtitle: subTitle, btntitle:'打开红包', linkurl: link, showtype:2});
    }

    function isAlert() {
    	var current = new Date();
    	current = current.getTime()/1000;
    	return (current <= 1478800800);
    }
}

/**
 * @ngInject
 */
function Context($q, apiClient, $state, auth, Shop) {
    var context = {
		shop: currentShop,
		setShop: setShop
    };
	var shop;
    return context;

	function setShop(s) {
		shop = s;
		return this;
	}

	function currentShop() {
		var deferred = $q.defer();
		if(!angular.isUndefined(shop)) {
			deferred.resolve(shop);
		}else {
			var authData = auth.getAdapter().getData();
			if(angular.isObject(authData) && angular.isArray(authData.bindTokens) && authData.bindTokens.length > 0) {
				Shop.query({ids: [authData.bindTokens[0]]}).then(function(datas){
		            context.setShop(datas.items[0]);
		            deferred.resolve(datas.items[0]);
		        });
			}else{
				$state.go('index');
				return ;
			}
		}
		return deferred.promise;
	}
}

/**
 * 系统信息缓存
 * @ngInject
 */
function AppInfo(StorageFactory) {
    var appInfo = StorageFactory.$new('appInfo');
    return appInfo;
}

/**
 * @ngInject
 */
function oauthCallback(auth, oauth) {
    return function(token) {
        var authData = auth.getAdapter().getData();
        if(!angular.isObject(authData)) {
            authData = {};
        }
        authData.bindTokens = [];
        authData.bindTokens.push(token.id);
        auth.getAdapter().setData(authData);
        oauth.options().put('oauthBackUrl', 'member.promotion.promotionmisc.list');
    }
}

})(window.angular);
