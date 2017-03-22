(function(angular, undefined){'use strict';
	/**
	* 商品详情模块服务
	*/
	angular
		.module('product.desc',[])
		.config(Configure)
		.controller('ProductDescCtrl', ProductDescCtrl);

	/**
	* @ngdoc config
	* @ngInject
	*/
	function Configure($routeProvider) {
		$routeProvider.when('/product/desc/:wareId/', {
			templateUrl: '/src/script/product/productDesc/desc.tpl.html',
			controller: 'ProductDescCtrl'
		});
	}

	/**
	* @ngdoc controller
	* @name ProductDescCtrl
	* @description 商品详情控制器，商品详情及商品操作日志
	* @ngInject
	*/
	function ProductDescCtrl($scope, StorageFactory, product, Sku, LogListManager) {
		$scope.loadingStatus = true;
		$scope.logStatus = false;
		var stockTotal = 0;
		var DescProduct = StorageFactory.$new('DescProduct');
		var productObj = DescProduct.get('product');
		if('id' in productObj){
			$scope.logStatus = true;
			$scope.logList = LogListManager.$get('productLog');
			$scope.logList.init();
			if(angular.isObject($scope.logList.filterOptions)){
				$scope.logList.filterOptions.productId = productObj.id;
			}else{
				$scope.logList.filterOptions = {};
				$scope.logList.filterOptions.productId = $scope.product.id;
			}
		}

		$scope.product = product.$new(productObj);
		if('shop' in productObj.source){
			var skuParam = {
				shopId: $scope.product.source.shop.id,
				wareId: $scope.product.source.wareId
			};
		}else{
			var skuParam = {
				shopId: $scope.product.platformItems[0].shop.id,
				wareId: $scope.product.platformItems[0].wareId
			};
		}
		

		Sku.getSkus(skuParam).then(function(skus){
	        $scope.skus = skus;
           	angular.forEach($scope.skus, function(sku, key){
           		sku.shops = [];
           		angular.forEach($scope.product.platformItems, function(shopItem, key){
           			if(shopItem.outerIds.length > 0){
           				if(shopItem.outerIds.indexOf(sku.outerId) > -1){
	           				sku.shops.push(shopItem.shop);
	           			}
           			}else{
           				sku.shops.push(shopItem.shop);
           			}
           		});
           		if(sku.stock !== undefined){
	           		stockTotal += sku.stock;
	           	}else{
	           		sku.stock = '未设置';
	           	}
           	});
	        if(stockTotal > 0){
	           	$scope.product.stockTotal = stockTotal;
	        }
	        if($scope.product.stockTotal === undefined){
	           	$scope.product.stockTotal = '未设置';
	        }
	        $scope.loadingStatus = false;
	    });
	}
})(window.angular);