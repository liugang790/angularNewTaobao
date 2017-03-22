(function(angular, undefined){'use strict';
	angular
		.module('user.center',[])
		.config(Configure)
		.provider('UserProfile', UserProfileProvider)
		.controller('UserProfileCtrl', UserProfileCtrl)
		.controller('UserPasswordCtrl', UserPasswordCtrl)
	;

	var UserProfileProvider;

	/**
	* ngdoc configure
	*/
	function Configure($stateProvider) {
		$stateProvider
			.state('user-center', {
				url: '/user-center'
			})
			.state('user-center.profile', {
				url: '/profile',
				templateUrl: '/src/script/user/userCenter/userProfile.tpl.html',
				controller: 'UserProfileCtrl'
			})
			.state('user-center.updatepsw', {
				url: '/updatepsw',
				templateUrl: '/src/script/user/userCenter/updatepsw.tpl.html',
				controller: 'UserPasswordCtrl'
			});
	}

	/**
	* ngdoc provider
	* @name UserProvider
	*/
	function UserProfileProvider() {
		this.apiConfig = {
			updatePswConfig : {
				url: '/restApi/user/update-psw',
				method: 'POST'
			},
			updateUserConfig : {
				url: '/restApi/user/update',
				method: 'POST'
			}
		};
		this.$get = userProfileFactory;
		UserProfileProvider = this;
	}
	/**
	* @ngInject
	*/
	function userProfileFactory($http, $q) {
		return {
			updatepsw : updatepsw,
			updateUser: updateUser
		};
		function updatepsw(data) {
			var httpConfig = angular.copy(UserProfileProvider.apiConfig.updatePswConfig);
			httpConfig.data = data;

			var defer = $q.defer();
            $http(httpConfig).success(function(response){
            	defer.resolve(response.data.user);
            }).error(function(errorResponse){
            	defer.reject({
            		errorCode: errorResponse.errorCode,
            		errorMessage: errorResponse.errorMessage
            	});
            });
            return defer.promise;
		}

		function updateUser(data) {
			var httpConfig = angular.copy(UserProfileProvider.apiConfig.updateUserConfig);
			httpConfig.data = data;

			var defer = $q.defer();
			$http(httpConfig).success(function(response){
				defer.resolve(response.data.user);
			}).error(function(errorResponse){
				defer.reject({
					errorCode: errorResponse.errorCode,
					errorMessage: errorResponse.errorMessage
				});
			});
			return defer.promise;
		}
	}

	/**
	* ngdoc controller
	* @name UserProfileCtrl
	* @ngInject
	*/
	function UserProfileCtrl($scope, $q, $location, auth, Shop, product, productDatabaseManager, UserProfile) {
		$scope.currentUser = null;
		var userPromise = auth.currentUser({cache: false});
		var shopPromise = Shop.query();
		var productPromise = product.query({source: {typeCode: 'database', value: 'multiShopProudct'}, page: 1, pageSize: 100000});
		$q.all([userPromise, shopPromise, productPromise]).then(function(data){
			$scope.currentUser = data[0];
			$scope.shopsTotal = data[1].total;
			$scope.productsTotal = data[2].total;
		});

		$scope.editStatus = false;
		$scope.editProfile = function() {
			$scope.editBtnStatus = 'editing';
			UserProfile.updateUser($scope.currentUser).then(function(data){
				$scope.currentUser = data;
				$scope.editBtnStatus = 'complete';
				$scope.editStatus = false;
			});
		}

		$scope.updatePsw = function(){
			$location.path('/user-center/updatepsw');
		}
	}

	/**
	* ngdoc controller
	* @name UserPasswordCtrl
	* @ngInject
	*/
	function UserPasswordCtrl($scope, $location, UserProfile, auth) {
		$scope.password = {
			origin: '',
			new: '',
			newAssure: ''
		};
		$scope.doUpdate = doUpdate;
		$scope.cancelUpdate = cancelUpdate;
		$scope.isWorking = isWorking;
		$scope.workStatus = false;

		function doUpdate() {
			if($scope.password.new !== $scope.password.newAssure){
				$scope.errorMessage = '两次输入的密码不相同！请重新输入';
			}else{
				$scope.workStatus = true;
				UserProfile.updatepsw($scope.password).then(function(data){
					auth.clear().then(function(){
						$location.path('/login');
						$scope.workStatus = false;
					});
				}, function(error){
					$scope.workStatus = false;
					$scope.errorMessage = error.errorMessage;
				});
			}
		}

		function cancelUpdate() {
			$location.path('/user-center/profile');
		} 

		function isWorking() {
			return $scope.workStatus;
		}
		
	}
})(window.angular);