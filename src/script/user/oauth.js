(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name user.oauth
 * @description 提供与第三方平台oauth相关的功能
 */
angular
    .module('user.oauth', [])
    .config(Configure)
    .provider('oauth', OauthProvider)
    .controller('oauthBackCtrl', OauthBackCtrl);

var oauthProvider;

/**
 * @ngdoc config
 * @description 配置用户授权模块路由
 */
function Configure($stateProvider) {
    $stateProvider
        .state('oauth', {
            url: '/oauth',
            views: {
                "": {
                    template: '<ui-view></ui-view>'
                },
                'menu': {
                    template: '<div ui-view="menu"></div>'
                }
             }
        })
        .state('oauth.callback', {
            url: '/callback/:appCode?code&state',
            templateUrl: '/src/script/user/oauth.callback.tpl.html',
            controller: 'oauthBackCtrl'
        });
}

/**
 * @ngdoc provider
 * @name oauthProvider
 * @description 提供对Oauth服务的配置
 */
function OauthProvider() {
    oauthProvider = this;

    // 客户端根URL路径
    oauthProvider.baseUrl;

    // 可以进行oauth授权的应用信息
    oauthProvider.apps = [];
    oauthProvider.addApp = addOauthAppInfo;

    oauthProvider.httpConfig = {
        url: '/restApi/shop/update-token',
        method: 'POST'
    };

    oauthProvider.authUrlHttpConfig = {
        url: '/restApi/app/auth-url',
        cache: true,
        method: 'POST'
    };

    oauthProvider.zhikrRegisterHttpConfig = {
        //url: 'http://super.zhikr.cn/SuperManager/user/regist',
        url: '/restApi/user/zhikr-register',
        method: 'POST',
        cache: false
    };

    oauthProvider.oauthCallbacks = [];

    oauthProvider.$get = OauthFactory;

    function addOauthAppInfo(appInfo) {
        oauthProvider.addApp.push(appInfo);
        return oauthProvider;
    }
}

/**
 * @ngInject
 * @ngdoc service
 * @name Oauth
 * @description 提供Oauth的Token请求服务
 */
function OauthFactory($http, $q, $filter, $injector, StorageFactory) {
    var oauth = {
        requestToken: requestToken,
        apps: getOauthApps,
        options: getOptions,
        zhikrRegister: zhikrRegister
    };
    var oauthApps = [];
    var optionStorage = StorageFactory.$new('oauth');
    return oauth;

    function requestToken(data) {
        var httpConfig = angular.copy(oauthProvider.httpConfig);
        data.redirectUrl = createCallbackUrl(data.appCode);
        httpConfig.data = data;
        return $http(httpConfig).then(function(response) {
            var token = response.data.data.shop;
            if(oauthProvider.oauthCallbacks.length > 0) {
                angular.forEach(oauthProvider.oauthCallbacks, function(callbackName) {
                    if($injector.has(callbackName)) {
                        var callback = $injector.get(callbackName);
                        callback(token);
                    }
                });
            }
            return token;
        })
    }

    function getOauthApps() {
        var defer = $q.defer();
        if(oauthApps.length > 0) {
            defer.resolve(oauthApps);
            return defer.promise;
        }

        if(!angular.isArray(oauthProvider.apps) || oauthProvider.apps.length < 1) {
            defer.reject();
            return defer.promise;
        }

        var apps = angular.copy(oauthProvider.apps);
        var datas = [];
        angular.forEach(oauthProvider.apps, function(app) {
            datas.push({
                code: app.code,
                callbackUrl: createCallbackUrl(app.code)
            });
        });
        var httpConfig = angular.copy(oauthProvider.authUrlHttpConfig);
        httpConfig.data = {apps: datas};
        return $http(httpConfig).then(function(response) {
            angular.forEach(response.data.data, function(authUrl, appCode) {
                var app = $filter('filter')(apps, {code: appCode});
                if(app.length > 0) {
                    app[0].authUrl = authUrl;
                }
            });
            oauthApps = apps;
            return apps;
        });
    }

    function getOptions() {
        return optionStorage;
    }

    function createCallbackUrl(appCode) {
        if(appCode == 'zhikrCloudTaobao') {
            return 'http://yddz.zhikr.cn/QianNiuCloudWeb/redirectMultiPlatform.jsp';
        }
        return oauthProvider.baseUrl + '/oauth/callback/' + appCode;
    }

    function zhikrRegister(params) {
        var defer = $q.defer();
        var httpConfig = angular.copy(oauthProvider.zhikrRegisterHttpConfig);
        httpConfig.data = params;
        return $http(httpConfig).then(function(response){
            defer.resolve(response);
            return defer.promise;
        });
    }
}

/**
 * @ngInject
 * @ngdoc controller
 * @name oauthBackCtrl
 * @description 提供Oauth授权回调操作的控制器
 */
function OauthBackCtrl($scope, $location, $window, $state, oauth, auth) {
    $scope.status       = 'requesting';
    $scope.isRequesting = isRequesting;
    $scope.isFailure    = isFailure;

    var search = angular.copy($location.search());
    search.appCode = $state.params.appCode;
    if(angular.isUndefined(search.code) || angular.isUndefined(search.appCode)) {
        $scope.status = 'failure';
        return;
    }

    oauth.requestToken(search).then(requestTokenSuccess, requestTokenFailure);

    function isRequesting() {
        return ($scope.status == 'requesting');
    }

    function isFailure() {
        return ($scope.status == 'failure');
    }

    function requestTokenFailure(error) {
        $scope.status = 'failure';
        if(!angular.isUndefined(error.data.errorMessage) && error.data.errorMessage === 'in blacklist') {
            $scope.errorMessage = '您已经退款，不能使用本应用了！如有疑问，请与客服联系，谢谢！';
        }else {
            $scope.errorMessage = '获取您的授权信息失败！请刷新页面或者关闭浏览器后重新打开再次尝试！';
        }
        
    }

    function requestTokenSuccess(token) {
        $state.go(oauth.options().get('oauthBackUrl'));
    }
}

})(window.angular);
