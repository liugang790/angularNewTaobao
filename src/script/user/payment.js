(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name user.payment
 * @description 提供与第三方平台payment相关的功能
 */
angular
    .module('user.payment', ['ngRoute'])
    .config(Configure)
    .provider('payment', PaymentProvider)
    .controller('paymentCtrl', PaymentCtrl);

var paymentProvider;

/**
 * @ngdoc config
 * @description 配置用户授权模块路由
 */
function Configure($routeProvider) {
    $routeProvider
        .when('/payment', {
            templateUrl: '/src/script/user/payment.tpl.html',
            controller: 'paymentCtrl'
        });
}

/**
 * @ngdoc provider
 * @name paymentProvider
 * @description 提供对Payment服务的配置
 */
function PaymentProvider() {
    paymentProvider = this;

    // 客户端根URL路径
    paymentProvider.baseUrl;

    paymentProvider.httpConfig = {
        url: '/restApi/shop/update-token',
        method: 'POST'
    };

    paymentProvider.$get = PaymentFactory;
}

/**
 * @ngInject
 * @ngdoc service
 * @name Payment
 * @description 提供Payment的Token请求服务
 */
function PaymentFactory($http, $q, $filter, $injector, StorageFactory) {
    var payment = {
        requestToken: requestToken
    };
    return payment;

    function requestToken(data) {
        var httpConfig = angular.copy(paymentProvider.httpConfig);
        httpConfig.data = data;
        return $http(httpConfig).then(function(response) {
            
        })
    }
}

/**
 * @ngInject
 * @ngdoc controller
 * @name paymentCtrl
 * @description 提供Payment操作的控制器
 */
function PaymentCtrl($scope, $window, $routeParams, payment, appConfig) {
    $scope.ver = null;
    $scope.versions = appConfig.versions;
    $scope.chose = chose;
    $scope.pay = pay;

    function chose(version) {
        $scope.ver = version;
    }    
    function pay(version) {
        if(version) {
            $window.open('http://cloudapi.yoloke.com/payment/create-order?code=' + version.code + '&subject=' + version.title + '&detail=' + version.title);
        }
    }

}

})(window.angular);
