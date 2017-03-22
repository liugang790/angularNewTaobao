(function(angular, undefined){'use strict';
	/**
	* 营销活动模块
	*/
	angular
		.module('promotionmisc', [
			'promotionmisc.ActivityList',
			'promotionmisc.CommonItem',
			'promotionmisc.TaobaoItem',
			'promotionmisc.TaobaoMjs',
			'promotionmisc.ActivityManage',
			'promotionmisc.ActivitySuccess',
			'promotionmisc.TaskList'
		])
		.config(Configure)
		.controller('promotionmiscMenuCtrl', promotionmiscMenuCtrl)
		.controller('promotionmiscMainCtrl', promotionmiscMainCtrl)
	;

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider.state('member.promotion.promotionmisc', {
			url: '/promotionmisc',
			views: {
				"": {
					template: '<ui-view></ui-view>',
					controller: 'promotionmiscMainCtrl'
				},
				'menu': {
					templateUrl: '/template/promotion/promotionmisc/subMenu.tpl.html',
					controller: 'promotionmiscMenuCtrl'
				}
			},
			parent: 'member.promotion'
		});
	}

	/**
	* @ngInject
	*/
	function promotionmiscMainCtrl($scope) {
		$scope.globals = {};
		$scope.$on('setGlobalValues', function(event, obj){
			$scope.globals[obj.key] = obj.value;console.log($scope.globals);
		});
	}

	/**
	* @ngInject
	*/
	function promotionmiscMenuCtrl($scope, $state) {
		$scope.$state = $state;
	}
})(window.angular);