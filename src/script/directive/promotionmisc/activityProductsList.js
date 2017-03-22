(function(angular, undefined){'use strict';

	/**
	* 活动商品列表指令模块
	*/
	angular
		.module('directives.activityProductsList', ['ngSanitize'])
		.directive('activityProductsList', ListDirective)
		.controller('DirectiveCtrl', DirectiveCtrl)
		.controller('productListItemCtrl', ListItemCtrl);

	/**
	* @ngInject
	*/
	function ListDirective() {
		return {
			restrict: 'E',
			templateUrl: '/template/ui/productsList.tpl.html',
			controller: 'DirectiveCtrl',
			transclude: true,
			scope: {
				list    : ' =',	
				actions : ' =',
				setting : ' ='
			},
			link: function(scope, element, attr){
				scope.width = attr.width;
			}
		};
	}

	/**
	* 活动商品列表指令控制器
	* @ngInject
	*/
	function DirectiveCtrl($scope, $q, $timeout, StorageFactory, $state, $filter, systemMath){
		$scope.$on('setProductListActivity', function(event, data){
			$scope.activityData = data;
		});

		var filterInitDefer = $q.defer();
		$scope.list.isSelectedAll = false;
		$scope.selectTitle = false;
		$scope.list.orderByOptions = [
			{code: 'list_time.asc', name: '上架时间从旧到新'},
			{code: 'list_time.desc', name: '上架时间从新到旧'},
			{code: 'sold_quantity.asc', name: '商品销量从低到高'},
			{code: 'sold_quantity.desc', name: '商品销量从高到低'}
		];
		$scope.listFilterData    = $scope.list.filterOptions;
		if($state.includes('member.promotion.promotionmisc.commonitem')) {
			$scope.typeCode = 'commonItem';
		}
		if(angular.isUndefined($scope.setting.showBtn)) {
			$scope.setting.showBtn = true;
		}
		if(angular.isUndefined($scope.setting.status)) {
			$scope.setting.status = false;
		}
		$scope.list.messages = {empty: '当前活动还未添加商品，快去添加吧！'};

		$scope.selecteAll        = selecteAll;
		$scope.addInboxProduct   = addInboxProduct;
		$scope.removeInboxProduct= removeInboxProduct;
		$scope.resetInboxProducts= resetInboxProducts;
		$scope.hasInboxProduct   = hasInboxProduct;
		$scope.toggleInboxProduct= toggleInboxProduct;

		$scope.$watch(function(){return $scope.list.items;}, function(newValue, oldValue){
			if(newValue !== oldValue && newValue.length > 0){
				var isSelectedAll = true;
				angular.forEach(newValue, function(item){
					if(!$scope.hasInboxProduct(item)){
						isSelectedAll = false;
					}
				});
				$scope.list.isSelectedAll = isSelectedAll;
			}
		});

		$scope.$watch(function(){return $scope.listFilterData.startModifyDate;}, function(newValue, oldValue){
			if(null === newValue){
				$scope.list.filterOptions.startModified = '';
			}
			if(newValue !== oldValue && angular.isString(newValue)){
				var date = newValue;
				$scope.list.filterOptions.startModified = systemMath.convertToTime(date);
			}
		});

		$scope.$watch(function(){return $scope.listFilterData.endModifyDate;}, function(newValue, oldValue){
			if(null === newValue){
				$scope.list.filterOptions.endModified = '';
			}
			if(newValue !== oldValue && angular.isString(newValue)){
				var date = newValue;
				$scope.list.filterOptions.endModified = systemMath.convertToTime(date);
			}
		});

		function toggleInboxProduct(product) {
			if(!hasInboxProduct(product)) {
				addInboxProduct(product);
			}else {
				removeInboxProduct(product);
			}
		}

		function addInboxProduct(product) {
			if(angular.isUndefined(product.disableAdd) || !product.disableAdd){
				$scope.list.cacheStorage.put(product.uniqueId, product);
				product.isInbox = true;
				if(!angular.isUndefined($scope.setting.limit)) {
					var allItems = $scope.list.cacheStorage.itemsToArray();
					var removeCount =  allItems.length - $scope.setting.limit;
					if(removeCount > 0) {
						for(var i=1; i<=removeCount; i++) {
							var toRemove = allItems.shift();
							removeInboxProduct(toRemove);
						}
					}
				}
			}
		}

		function removeInboxProduct(product) {
			$scope.list.cacheStorage.remove(product.uniqueId);
			var item = $filter('filter')($scope.list.items, {uniqueId:product.uniqueId});
			if(item.length > 0) {
				item[0].isInbox = false;
			}
		}

		function resetInboxProducts() {
			$scope.list.cacheStorage.removeAll();
			angular.forEach($scope.list.items, function(item) {
				item.isInbox = false;
			});
		}

		function hasInboxProduct(product) {
			return $scope.list.cacheStorage.has(product.uniqueId);
		}

		function selecteAll(check) {
			if(check) {
				angular.forEach($scope.list.items, function(product) {
					if(!$scope.hasInboxProduct(product)) {
						$scope.addInboxProduct(product);
					}else{
						if(!angular.isUndefined(product.disableAdd) && product.disableAdd){
							$scope.removeInboxProduct(product);
						}
					}
				})
			} else {
				angular.forEach($scope.list.items, function(product) {
					$scope.removeInboxProduct(product);
				})
			}
		}
	}

	/**
	* 活动商品控制器
	* @ngInject
	*/
	function ListItemCtrl($scope, StorageFactory) {
		$scope.maskTitle = '';
		$scope.activityLabelStatus = false;
		
		$scope.$watch(function(){return $scope.activityData;}, function(newData, oldData){
			if(newData !== undefined) {
				checkActivity();	
			}
		});
		$scope.checkActivity = checkActivity;

		function  checkActivity() {
			var zhekou = 0;
			var mjs = 0;
			$scope.activityLabel = '已参加';
			var tooltipContent = '';
			angular.forEach($scope.product.activities, function(pActivity){
				if(pActivity.typeCode === 'taobaoitem'|| pActivity.typeCode === 'taobaocommonitem') {
					zhekou = zhekou + 1;
					tooltipContent = tooltipContent + '折扣活动：[' + pActivity.detail.priceTag + ']<br />';
					if($scope.typeCode === 'commonItem' && pActivity.typeCode === 'taobaocommonitem') {
						$scope.maskTitle = '已参加<br/>其他活动';
						$scope.product.disableAdd = true;
					}
				}
				if(pActivity.typeCode === 'taobaomjs') {
					mjs = mjs + 1;	
					tooltipContent = tooltipContent + '满减活动：[' + pActivity.detail.priceTag + ']<br />';
				}
				if(pActivity.id === $scope.activityData.id){
					$scope.maskTitle = '已参加<br/>本次活动';
					$scope.product.disableAdd = true;
				}
			});
			if(mjs > 0){
				$scope.activityLabelStatus = true;
				$scope.activityLabel = $scope.activityLabel + mjs + '个满减活动';
			}
			if(zhekou > 0){
				$scope.activityLabelStatus = true;
				$scope.activityLabel = $scope.activityLabel  + zhekou +'个折扣活动';
			}
			if(tooltipContent != ''){
				$scope.activityTooltipContent = tooltipContent;
			}
			if($scope.maskTitle !== '' && !angular.isUndefined($scope.maskTitle)){
				$scope.maskStatus = true;
			}else{
				$scope.maskStatus = false;
			}
		}
	}
})(window.angular);