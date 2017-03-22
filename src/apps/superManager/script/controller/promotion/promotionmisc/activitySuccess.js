(function(angular, undefined){'use strict';
	/**
	* 活动创建、修改成功模块
	*/
	angular
		.module('promotionmisc.ActivitySuccess', [])
		.config(Configure)
		.controller('ActivitySuccessCtrl', ActivitySuccessCtrl);

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider.state('member.promotion.promotionmisc.success', {
			url: '/success/:activityId?status',
			templateUrl: '/template/promotion/promotionmisc/success.tpl.html',
			controller: 'ActivitySuccessCtrl'
		});
	}

	/**
	* @ngInject
	*/
	function ActivitySuccessCtrl($scope, $state, Activity, $stateParams) {
		Activity.getActivity({id: $stateParams.activityId}).then(function(data){
			$scope.activity = data;
		});
		if($stateParams.status !== null) {
			switch($stateParams.status) {
				case 'create':
					$scope.pageStatus = '创建';
					break;
				case 'edit':
					$scope.pageStatus = '修改';
					break;
				case 'restart':
					$scope.pageStatus = '重启';
					break;
			}
		}

		$scope.returnList = returnList;
		$scope.setSharePlat = setSharePlat;
		$scope.gotoPage = gotoPage;
		$scope.toManage = toManage;

		$scope.share={ispop : false}
		function setSharePlat(plat) {
			$scope.share.ispop = true;
			$scope.share.tabs = [plat,'preview'];
		}

		function returnList(){
			$state.go('^.list');
		}

		function toManage(activity, tab) {
			$state.go('^.manage', {activityId: activity.id, tab: tab});
		}

	    function gotoPage(state){
	    	$state.go(state);
	    }
	}
})(window.angular);