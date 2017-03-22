(function(angular, undefined){'use strict';

	/**
	* 活动海报指令
	*/
	angular
		.module('directives.activityZhekouPoster', ['ngAnimate', 'angular-clipboard'])
		.directive('activityPosterList', activityPosterListDirective)
		.directive('activityPosterSet', activityPosterSetDirective)
		.directive('activityPosterDetail', activityPosterDetailDirective)
		.controller('posterListCtrl', posterListCtrl)
		.controller('posterSetCtrl', posterSetCtrl)
		.controller('posterDetailCtrl', posterDetailCtrl)
		.constant('zhekouPosters', [
			{
				typeCode: '1rowType', 
				tplName: '1rowType1', 
				name:'一行显示1个样式1', 
				dir: "/template/activity/poster/1rowType1.tpl.html",
				image: 'https://img.alicdn.com/imgextra/i1/1077687618/TB2BxigmXXXXXXFXpXXXXXXXXXX-1077687618.png'
			}
		])
		.constant('posterTypes', [
			{name: '每行显示1个', code: '1rowType'}
		])
		.filter('to_trusted', ['$sce', function($sce){
	        return function(text) {
	            return $sce.trustAsHtml(text);
	        };
	    }])
	;

	function activityPosterDetailDirective() {
		return {
			require: '^^activityPosterList',
			restrict: 'E',
			templateUrl: '/template/activity/poster/posterDetail.tpl.html',
			controller: 'posterDetailCtrl',
			scope: {
				activity: '=',
				poster: '='
			}
		};
	}

	/**
	* @ngInject
	*/
	function posterDetailCtrl($scope, product, $sce, $window, clipboard) {
		$scope.poster.template = $sce.trustAsHtml($scope.poster.template);
		$scope.products = [];
		angular.forEach($scope.poster.addedProducts, function(id){
			product.get({id: id, shopId: $scope.activity.shop.id}).then(function(result){
				$scope.products.push(result);
			});
		})
		$scope.posterPrevewCollapse = false;
		$scope.posterAddedCollapse = false;

		$scope.copyPoster = copyPoster;

		function copyPoster(poster) {
			clipboard.copyText(poster.template);
			$scope.copyTooltip = '复制成功';
			$scope.tooltipIsOpen = true;
			$window.setTimeout(function() {
			     $scope.$apply(function() {
			        $scope.copyTooltip = '';
					$scope.tooltipIsOpen = false;
			     });
			 }, 2000);
		}
	}

	function activityPosterListDirective() {
		return {
			require: '^^activityPosterSet',
			restrict: 'E',
			templateUrl: '/template/activity/poster/zhekouPosterList.tpl.html',
			controller: 'posterListCtrl',
			transclude: true,
			scope: {
				activity: '=',
				posters: '='
			}
		};
	}

	/**
	* @ngInject
	*/
	function posterListCtrl($scope, zhekouPosters, ActivityPoster, $state) {
		$scope.checkPosterStatus = false;
		$scope.posterToCheck = false;
		angular.forEach($scope.posters, function(poster) {
			poster.infoStr = '';
			poster.infoStr += ('已投放到 ' + poster.addedProducts.length + '个商品');
			angular.forEach(zhekouPosters, function(type){
				if(type.tplName === poster.templateCode) {
					poster.templateImg = type.image;
				}
			});
		});
		$scope.checkPoster = checkPoster;
		$scope.clearPoster = clearPoster;

		function clearPoster(poster) {
			ActivityPoster.clearPoster({id: poster.activity}).then(function(response){
				$state.go('member.promotion.promotionmisc.tasklist');
			}, function(error){
				$scope.errorMessage = error.errorMessage;
			});
		}

		function checkPoster(poster) {
			$scope.checkPosterStatus = true;
			$scope.posterToCheck = poster;
		}
	}

	function activityPosterSetDirective() {
		return {
			restrict: 'E',
			templateUrl: '/template/activity/poster/zhekouPosterSet.tpl.html',
			controller: 'posterSetCtrl',
			scope: {
				activity: '='
			}
		};
	}

	/**
	* @ngInject
	*/
	function posterSetCtrl($scope, posterTypes, zhekouPosters, ActivityPoster, listFactory, ActivityProduct, $q,  $state, $timeout, StorageFactory) {
		$scope.zhekouPosters = zhekouPosters;
		$scope.posterTypes = posterTypes;
		$scope.posterSelectType = $scope.posterTypes[0].code;
		angular.forEach($scope.posterTypes, function(poster){
			poster.checked = false;
		});
		var factory = {
			query: queryAdded
		};
		var posterData = {};
		$scope.creating 				= false;
		$scope.errorMessage 			= false;
		$scope.disableCreate 			= true;
		$scope.setting = {add: '添加', added: ' ', hideOrder: true};
		$scope.activityPosters 			= [];
		$scope.checkPoster 				= false;
		$scope.posterAddedCollapse 		= true;
		$scope.posterSetCollapse 		= true;
		$scope.selectProductsSetToPoster= false;
		$scope.selectProductsToSetPoster= false;
		$scope.selectPosterStyles 		= true;
		$scope.activityProductsList = listFactory.$new(factory, {ns:'productsSetToPoster'});
		$scope.activityProductsList.filterOptions= {id: $scope.activity.id}; 
		$scope.productsList = listFactory.$new(ActivityProduct, {ns: 'productsToSetPoster'});
		$scope.productsList.filterOptions = {shopId: $scope.activity.shop.id};

		$scope.openPosterSelector 		= openPosterSelector;
		$scope.openProductsToSetPoster 	= openProductsToSetPoster;
		$scope.openProductsSetToPoster 	= openProductsSetToPoster;
		$scope.selectPoster 			= selectPoster;
		$scope.createPoster 			= createPoster;
		$scope.chnageStatus 			= chnageStatus;

		function chnageStatus(arg) {
			$scope[arg] = !$scope[arg];
		}

		ActivityPoster.queryPoster({id: $scope.activity.id}).then(function(data){
			if(data.poster !== null && data.poster.addedProducts.length !==0) {
				$scope.activityPosters.push(data.poster);
			}
		});
		selectPoster($scope.zhekouPosters[0]);

		function openProductsSetToPoster() {
			$scope.selectProductsSetToPoster = !$scope.selectProductsSetToPoster;
			$scope.selectPosterStyles = false;
			$scope.selectProductsToSetPoster = false;
		}

		function openPosterSelector() {
			$scope.selectPosterStyles = !$scope.selectPosterStyles;
			$scope.selectProductsSetToPoster = false;
			$scope.selectProductsToSetPoster = false;
		}

		function openProductsToSetPoster() {
			$scope.selectProductsToSetPoster = !$scope.selectProductsToSetPoster;
			$scope.selectPosterStyles = false;
			$scope.selectProductsSetToPoster = false;
		}

		function selectPoster(poster) {
			$scope.checkPoster = poster.tplName;
			$scope.checkPosterImage = poster.image;
		}

		function createPoster() {
			$scope.productsSetToPoster = $scope.activityProductsList.cacheStorage.itemsToArray();
			$scope.productsToSetPoster = $scope.productsList.cacheStorage.itemsToArray();
			if($scope.productsSetToPoster.length ===0 || $scope.productsToSetPoster.length === 0) {
				$scope.errorMessage = ($scope.productsToSetPoster.length ===0) ? '您还未选择投放海报的商品！' : '您还未选择海报内容！';
				$.alert({
		    		title: '错误提示',
		    		body: $scope.errorMessage
		    	});
			}else {
				$scope.selectProductsToSetPoster = false; 
				$scope.selectPosterStyles = false;
				$scope.selectProductsSetToPoster = false;
			
				$scope.creating = true;
				$scope.errorMessage = false;
				compilePoster().then(function(posterResult){
					posterData = angular.copy(posterResult);
					posterData.itemIds = [];
					angular.forEach($scope.productsToSetPoster, function(item){
						posterData.itemIds.push(item.source.wareId);
					});
					ActivityPoster.createPoster(posterData).then(function(response){
						$scope.creating = false;
						$scope.activityProductsList.cacheStorage.removeAll();
						$scope.productsList.cacheStorage.removeAll();
						$state.go('member.promotion.promotionmisc.tasklist');
					}, function(error){
						$scope.errorMessage = '创建海报出错：' + error.errorMessage;
					});
				});
			}
			
		}

		function queryAdded(params) {
			var deferred = $q.defer();
			ActivityProduct.getAdded(params).then(function(response){
				var result = {items: [], total: response.total};	
				angular.forEach(response.items, function(item){
					item.logo = item.picUrl;
					item.taobaoPrice = item.price;
					item.newPrice = parseFloat(item.price/100).toFixed(2);
					item.price = parseFloat(item.oldPrice/100).toFixed(2);
					item.cut = parseFloat(item.price - item.newPrice).toFixed(2);
					item.detail.promotionValue = parseFloat(item.detail.promotionValue/100).toFixed(2);
					item.uniqueId = item.activity.id + ':' + item.itemId;
					result.items.push(item);
				});
				deferred.resolve(result);
			});
			return deferred.promise;
		}

		function compilePoster() {
			var deferred = $q.defer();
			angular.forEach(zhekouPosters, function(itemPoster){
				if(itemPoster.tplName === $scope.checkPoster) {
					ActivityPoster.compileTemp(itemPoster.dir, $scope).then(function(data){
						var result = {};
						result.templateCode = $scope.checkPoster;
						result.template = data;
						result.note = itemPoster.name;
						result.isAutoInsert = true;
						result.id = $scope.activity.id;
						deferred.resolve(result);
					});
				}
			});
			return deferred.promise;
		}
	}
})(window.angular);