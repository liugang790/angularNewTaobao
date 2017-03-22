(function(window, angular, undefined){ 'use strict';

/**
* ngdoc module
* @name productBase
* @description 全店商品库模块，管理商品库内的商品
*/
angular
	.module('product.multiShopProduct', [])
	.config(Configure)
	.factory('multiShopProduct', ProductBaseFactory)
	.controller('multiShopProductListCtrl', ProductBaseListCtrl);

/**
* ngdoc config
* @ngInject
*/
function Configure($routeProvider) {
	$routeProvider.when('/product/list', {
			templateUrl: '/src/script/product/multiShopProduct/list.tpl.html',
			controller: 'multiShopProductListCtrl'
		})
	;
}

/*
* ngdoc factory
* @description 商品库接口管理
* @ngInject
*/

function ProductBaseFactory($http, Product) {
	var service = {
		query: queryProducts
	};
	return service;

	function queryProducts(params) {
		if(angular.isUndefined(params)){
			params = {};
		}
		return Product.query(params).then(function(data){
			return {
				items : data.items,
				total : data.total
			}
		});
	}
}

/**
* ngdoc controller
* @description 商品库列表控制器
* @ngInject
*/
function ProductBaseListCtrl($scope, productListManager) {
	$scope.productList = productListManager.$get('multiShopProduct');
	$scope.productList.init();
}

})(window, window.angular);
