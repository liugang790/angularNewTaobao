(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name user
 * @description 提供与用户相关的功能
 */
angular
    .module('user', ['user.auth', 'user.oauth', 'user.register', 'user.center'])
    .config(Configure)
    .controller('loginCtrl', LoginCtrl)
    .service('isAuthPage', IsAuthPage)
    .controller('ResetPswCtrl', ResetPswCtrl)
    .provider('UserAccount', UserAccountProvider)
;

/**
 * @ngdoc config
 * @ngInject
 * @description 用户模块配置
 */
function Configure($stateProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: '/src/script/user/login.tpl.html',
            controller: 'loginCtrl'
        })
        .state('forgetpsw', {
            state: '/forgetpsw',
            templateUrl: '/template/user/forgetpsw.tpl.html',
            controller: 'ResetPswCtrl'
        })
        .state('resetpsw', {
            url: '/resetpsw/:code',
            templateUrl: '/template/user/resetpsw.tpl.html',
            controller: 'ResetPswCtrl'
        })
    ;
}

/**
 * @ngdoc service
 * @ngInject
 * @name isAuthPage
 * @description 返回当前是否是处于一个用户授权登陆页面
 */
function IsAuthPage(isNavbarActive) {
    return function() {
        if(isNavbarActive('/oauth/callback')
            || isNavbarActive('/login')
            || isNavbarActive('/register')
            || isNavbarActive('/product/copy')
            || isNavbarActive('/resetpsw')
        ) {
            return true;
        }
        return false;
    }
}

var provider;
function UserAccountProvider() {
    provider = this;
    this.validAccountConfig = {
        url   : '/restApi/user/valid-account',
        method: 'POST',
        data  : {}
    };
    this.sendEmailConfig = {
        url   : '/restApi/user/send-email',
        method: 'POST',
        data  : {}
    };
    this.resetPswConfig = {
        url : '/restApi/user/reset-psw',
        method: 'POST',
        data: {}
    };
    this.$get = UserAccountFactory;
}

/**
* @ngInject
*/
function UserAccountFactory(apiClient, $http, $q) {
    return {
        validAccount: validAccount,
        sendEmail: sendEmail,
        resetPsw: resetPsw
    };

    function validAccount(params) {
        var httpConfig = provider.validAccountConfig;
        httpConfig.data = params;
        var defer = $q.defer();
        $http(httpConfig).then(function(data){
            defer.resolve(data);
        }, function(error){
            defer.reject(error.data);
        });
        return defer.promise;
    }

    function sendEmail(params) {
        var httpConfig = provider.sendEmailConfig;
        httpConfig.data = params;
        var defer = $q.defer();
        $http(httpConfig).then(function(data){
            defer.resolve(data);
        }, function(error){
            defer.reject(error.data);
        });
        return defer.promise;
    }

    function resetPsw(params) {
        var httpConfig = provider.resetPswConfig;
        httpConfig.data = params;
        var defer = $q.defer();
        $http(httpConfig).then(function(response){
            defer.resolve(response.data);
        }, function(error){
            defer.reject(error.data);
        });
        return defer.promise;
    }
}

/**
 * @ngdoc controller
 * @ngInject
 * @name loginCtrl
 * @description 用户登陆控制器
 */
function LoginCtrl($scope, $location, auth, oauth, appConfig) {
    $scope.gotoRegister = gotoRegisterPage;
    $scope.auth         = auth;
    $scope.doLogin      = doLogin;
    $scope.status       = 'idle';
    $scope.isWorking    = isWorking;
    $scope.resetPsw     = appConfig.resetPsw;
    $scope.hideRegister = false;
    if(!angular.isUndefined(appConfig.hideRegister)) {
        $scope.hideRegister = appConfig.hideRegister;
    }
    $scope.forgetPsw    = forgetPsw;

    auth.isAuth().then(function() {
        $location.path('/');
    })

    function isWorking() {
        return ($scope.status === 'working');
    }

    function doLogin() {
        $scope.status = 'working';
        auth.auth().then(function() {
            $scope.status = 'idle';
            $scope.$emit('$logined');
            $location.path('/');
        }, function(response) {
            $scope.status = 'failure';
            $scope.errorMessage = response.data.errorMessage;
        });
    }

    function gotoRegisterPage() {
        $location.path('/register');
    }

    function forgetPsw() {
        $location.path('/forgetpsw');
    }
    // todo: 用户第一次进入场景开发完成后应该删除
    $scope.oauthApps    = [];
    oauth.apps().then(function(apps) {
        $scope.oauthApps = apps;
    });
}

/**
* @ngInject
* 发送邮件重设密码控制器
*/
function ResetPswCtrl($scope, UserAccount, $routeParams, $location) {
    if($routeParams.code) {
        $scope.code = $routeParams.code;
        $scope.password = '';
        $scope.repassword = '';
    }

    $scope.sendEmail = sendEmail;
    $scope.doReset = doReset;

    function doReset() {
        if($scope.password !== $scope.repassword) {
            $scope.errorMessage = '密码输入不一致！请确认密码和重复密码相同';
        }else{
            $scope.reseting = true;
            UserAccount.resetPsw({password: $scope.password, code: $scope.code}).then(function(data){
                $scope.reseting = false;
                $location.path('/login');
            }, function(error){
                $scope.reseting = false;
                $scope.errorMessage = error.errorMessage;
            });
        }
    }

    function sendEmail(email) {
        $scope.sending = true;
        UserAccount.validAccount({email: email}).then(function(user){
            UserAccount.sendEmail({email:email}).then(function(){
                $scope.sending = false;
                $scope.sended = true;
                $scope.errorMessage = false;
            }, function(error){
                $scope.sending = false;
                $scope.errorMessage = error.errorMessage;
            });
        },function(error){
            $scope.sending = false;
            $scope.errorMessage = error.errorMessage;
        });
    }
}

})(window.angular);
