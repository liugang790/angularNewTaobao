(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name user.register
 * @description 提供与用户注册相关的功能
 */
angular
    .module('user.register', ['user.auth'])
    .config(Configure)
    .controller('registerCtrl', RegisterCtrl)
    .provider('register', RegsiterProvider);

var registerProvider;

/**
 * @ngdoc provider
 * @ngInject
 * @description 用户注册模块配置
 */
function Configure($stateProvider) {
    $stateProvider
        .state('register', {
            url: '/register',
            templateUrl: '/src/script/user/register.tpl.html',
            controller: 'registerCtrl'
        });
}

/**
 * @ngdoc controller
 * @ngInject
 * @name registerCtrl
 * @description 用户注册控制器
 */
function RegisterCtrl($scope, $location, register, appConfig) {
    $scope.adminRegister = false;
    if(!angular.isUndefined(appConfig.adminRegister)) {
        $scope.adminRegister = appConfig.adminRegister;
    }

    $scope.gotoLogin  = gotoLoginPage;
    $scope.doRegister = doRegister;
    $scope.register   = register;

    function doRegister() {
        if($scope.adminRegister) {
            if($scope.adminPassword !== 'yn12316dc') {
                register.isFailure(true, '管理密码不正确，请重新输入');
            }else{
                register.doRegister().then(function(redirectPath) {
                    $scope.$emit('$logined');
                    $location.path(redirectPath);
                });
            }
        }else{
            register.doRegister().then(function(redirectPath) {
                $scope.$emit('$logined');
                $location.path(redirectPath);
            });
        }
        
    }

    function gotoLoginPage() {
        $location.path('/login');
    }
}

/**
 * @ngdoc provider
 * @name registerProvider
 */
function RegsiterProvider() {
    registerProvider = this;
    registerProvider.$get = Register;

    // 注册成功后是否自动登陆
    registerProvider.autoLogin = true;
    registerProvider.apiUrl = '/restApi/user/register';
}

/**
 * @ngdoc service
 * @ngInject
 * @name register
 * @description 用户注册服务
 */
function Register($http, $q, auth) {
    var register = {
        status: 'idle',
        data: {
            companyName: '',
            email   :'',
            password: ''
        },
        isIdle: isIdle,
        isWorking: isWorking,
        isFailure: isFailure,
        doRegister: doRegister
    };
    return register;

    function isIdle(isSetting) {
        return validOrChangeStatus('idle', isSetting);
    }

    function isWorking(isSetting) {
        return validOrChangeStatus('working', isSetting);
    }

    function isFailure(isSetting, errorMessage) {
        if(!angular.isUndefined(errorMessage)) {
            register.errorMessage = errorMessage;
        }
        return validOrChangeStatus('failure', isSetting);
    }

    function doRegister(data) {
        register.isWorking(true);

        var defer = $q.defer();

        var httpConfig = {
            url   : registerProvider.apiUrl,
            method: 'POST',
            data  : register.data
        };
        $http(httpConfig).then(function(response) {
            if(registerProvider.autoLogin) {
                auth.getAdapter().getData().email    = register.data.email;
                auth.getAdapter().getData().password = register.data.password;
                auth.auth().then(function() {
                    defer.resolve('/');
                });
            } else {
                register.isIdle(true);
                defer.resolve('/login');
            }
        }, function(response) {
            if(angular.isUndefined(response.data.errorMessage)) {
                var errorMessage = '网络故障，请确认您当前已连接互联网！';
            } else {
                var errorMessage = response.data.errorMessage;
            }
            register.isFailure(true, errorMessage);
            defer.reject(response);
        });

        return defer.promise;
    }

    function validOrChangeStatus(status, isSetting) {
        if(!angular.isUndefined(isSetting)) {
            register.status = status;
        }
        return (register.status === status);
    }
}

})(window.angular);
