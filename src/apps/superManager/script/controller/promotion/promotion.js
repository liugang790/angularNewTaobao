(function(angular, undefined){'use strict';

	/**
	* 营销模块
	*/
	angular
		.module('promotionModule',[
			'promotionmisc'
		])
		.config(Configure)
	;

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider.state('member.promotion', {
			url: '/promotion',
			parent: 'member',
			views: {
				"": {
					template: '<ui-view></ui-view>'
				},
				'menu': {
					template: '<div ui-view="menu"></div>'
				}
			}
		})
	}
})(window.angular);