(function(angular, undefined){'use strict';

	angular.module('productCopy', [
		'productCopy.copyTaobaoTmall',
		'productCopy.copyAlAndJd',
		'productCopy.copyrecord',
		'productCopy.copybbAndJd'
	])
	.config(Configure)
	.controller('productCopyMainCtrl', productCopyMainCtrl)
	;

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider
			.state('member.product.copy', {
				url: '/copy',
				views: {
					"": {
						template: '<ui-view></ui-view>',
						controller: 'productCopyMainCtrl'
					},
					'menu': {
						templateUrl: '/template/product/productCopy/subMenu.tpl.html'
					}
				},
				parent: 'member.product'
			})
		;
	}
	/**
	* @ngInject
	*/
	function productCopyMainCtrl($state) {
		// console.log($state.get());
	}
})(window.angular);