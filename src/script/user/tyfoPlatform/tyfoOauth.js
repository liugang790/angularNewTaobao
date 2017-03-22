(function(angular, undefined){'use strict';

	/**
	* 天虎云商登录授权管理
	*/
	angular.module('user.oauth.tyfoPlatform', [])
		.config(Configure)
		.controller('tyfoAuthCtrl', TyfoAuthCtrl)
		.provider('tyfoAuth', TyfoAuthProvider);

	/**
	 * @ngInject
	 */
	function Configure($routeProvider) {
		$routeProvider.when('/tyfo/oauth/authorize', {
			templateUrl: '/template/user/tyfoLogin.tpl.html',
			controller: 'tyfoAuthCtrl'
		});
	}

	var provider;
	function TyfoAuthProvider() {
		provider = this;

		this.loginApi = 'tyfo.user.login';
		this.$get = TyfoAuthFactory;
	}

	/**
	* @ngInject
	*/
	function TyfoAuthFactory(apiClient) {
		return {
			login: login
		};

		function login(args) {
			return apiClient.$new(provider.loginApi).send(args).then(function(response){
				return response;
			});
		}
	}

	/**
	* @ngInject
	*/
	function TyfoAuthCtrl($scope, oauth, $location, tyfoAuth, $window, auth) {
		var redirectUrl = $location.search().redirect_uri;

		$scope.doLogin = doLogin;

		function doLogin() {
			$scope.errorMessage = false;
			$scope.logining = true;
			auth.currentUser({cache: true}).then(function(user){
				tyfoAuth.login({account: $scope.account, password: $scope.password, user: user.id}).then(function(response){
					$window.location.href = redirectUrl;
				}, function(error){
					$scope.errorMessage = error.errorMessage;
				});
			});
			
		}
	}
})(window.angular);