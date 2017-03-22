(function(angular, undefined){'use strict';

angular
	.module('product.sku', [])
	.directive('skuList', SkuListDirective)
	.controller('skuListDirectiveCtrl', skuListDirectiveCtrl)
	.provider('Sku', SkuProvider);


/**
* ngdoc directive 
* @name skuList
* @description sku列表指令
*/
function SkuListDirective() {
	return {
		require    : '^list',
        restrict   : 'E',
        replace    : true,
        transclude : true,
        templateUrl: '/src/script/product/productList/skulist.tpl.html',
        controller : skuListDirectiveCtrl,
        scope      : {
            skus: "=ngModel",
            product: "="
        }
	};
}

/**
* ngdoc controller
* @name skuListDirectiveCtrl
* @description sku列表控制器
* @ngInject
*/
function skuListDirectiveCtrl($scope){
	
}


/**
* ngdoc provider
* @name SkuProvider
* @ngdescription 商品sku服务
* @ngInject
*/
function SkuProvider(){
	this.apiConfig = {
		get: {
			url: '/restApi/product/get-sku',
			method: 'POST',
			cache: true
		}
	};
	var provider = this;
	this.$get = SkuFactory;

	function SkuFactory($http){
		return {
			getSkus: getSkus
		};
		function getSkus(data) {
			var httpConfig = angular.copy(provider.apiConfig.get);
			if(typeof data == undefined){
				data = {};
			}
			httpConfig.data = data;
			return $http(httpConfig).then(function(response){
				return response.data.data;
			});
		}
	}
}

})(window.angular);