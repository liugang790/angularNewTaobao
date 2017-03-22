(function(angular, undefined){'use strict';

	/**
	* 单个商品设置折扣、减价指令
	*/
	angular
		.module('directives.discountProduct',[])
		.directive('discountProduct', DiscountProductDirective)
		.controller('DiscountProductDirectiveCtrl', DiscountProductDirectiveCtrl);

	/**
	* ngdoc directive
	* 单个商品折扣减价操作控制器
	* @ngInject
	*/
	function DiscountProductDirective(){
		return {
			restrict: 'E',
			templateUrl: '/template/ui/discountProduct.tpl.html',
			controller: 'DiscountProductDirectiveCtrl',
			transclude: true,
			scope: {
				product: "=item",
				removeProduct: '&click'
			}
		};
	}

	/**
	* 商品折扣减价指令控制器
	* @ngInject
	*/
	function DiscountProductDirectiveCtrl($scope, systemMath, $rootScope) {
		$scope.product.discountIndex = (!angular.isUndefined($scope.product['discountIndex'])) ? $scope.product.discountIndex : 10;
		$scope.product.cutIndex = (!angular.isUndefined($scope.product['cutIndex'])) ? $scope.product.cutIndex : 0;
		$scope.product.newPrice = (!angular.isUndefined($scope.product['newPrice'])) ? $scope.product.newPrice : parseFloat($scope.product.price);

		$scope.discount = discount;
		$scope.cutDown = cutDown;

		/**
		* 商品打折操作
		*/
		function discount() {
			var price = systemMath.discount($scope.product.discountIndex, $scope.product.price);
			$scope.product.newPrice = (price === 0) ? 0.01 : price;
		}
		/**
		* 商品减价操作
		*/
		function cutDown() {
			var price =  systemMath.cutDown($scope.product.cutIndex, $scope.product.price);
			$scope.product.newPrice = (price === 0) ? 0.01: price;
		}

		$scope.$watch(function(){return $scope.product.newPrice}, function(newValue, oldValue){
			if(newValue !== $scope.product.price) {
				$scope.product.discountIndex = systemMath.getDiscountIndex(newValue, $scope.product.price);
				$scope.product.cutIndex = systemMath.getCutDownIndex(newValue, $scope.product.price);

				$rootScope.$broadcast('setCommonItemProductByUniqueId', {uniqueId: $scope.product.uniqueId, value: $scope.product})
			}
			if(newValue !== oldValue){
				if(newValue > $scope.product.price){
					$scope.errorStatus = true;
					$scope.errorMessage = '折扣价格不能大于原价！';
				}else{
					$scope.errorStatus = false;
				}
				$scope.product.discountIndex = systemMath.getDiscountIndex(newValue, $scope.product.price);
				$scope.product.cutIndex = systemMath.getCutDownIndex(newValue, $scope.product.price);

				$rootScope.$broadcast('setCommonItemProductByUniqueId', {uniqueId: $scope.product.uniqueId, value: $scope.product})
			}
		});
	}
})(window.angular);