(function(angular, undefined){'use strict';

	angular.module('productModule', [
		'productCopy',
		'phoneDetail',
		'stock',
	])
		.config(Configure)
	;

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider
			.state('member.product', {
				url : '/product',
				parent: 'member',
				views: {
					"": {
						template: '<ui-view></ui-view>'
					},
					'menu': {
						template: '<div ui-view="menu"></div>'
					}
				}
			});
	}
})(window.angular);