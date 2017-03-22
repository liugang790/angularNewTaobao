(function(angular, undefined){'use strict';
	/**
	* 活动管理模块
	*/
	angular
		.module('promotionmisc.ActivityManage', [])
		.config(Configure)
		.controller('ActivityManageCtrl', ActivityManageCtrl);

	/**
	* @ngInject
	*/
	function Configure($stateProvider){
		$stateProvider.state('member.promotion.promotionmisc.manage', {
			url: '/manage/:activityId/:tab',
			params: {
				tab: 'info'
			},
			parent: 'member.promotion.promotionmisc',
			templateUrl: '/template/promotion/promotionmisc/manage.tpl.html',
			controller: 'ActivityManageCtrl'
		});
	};

	/**
	* @ngInject
	*/
	function ActivityManageCtrl($scope, $state, $stateParams, Activity, listFactory, ActivityProduct, appConfig, ActivityPage, systemMath) {
		$scope.currentTab = $stateParams.tab;
		$scope.isBooting = true;

		var ProductManage = {
			query: getAdded
		};

		$scope.list = listFactory.$new(ProductManage, {ns: 'discountActivityProductsInbox'});
		$scope.list.filterOptions = {};
		$scope.list.addLoadCallback(function(){
			var items = [];
			angular.forEach($scope.list.items, function(value){
				if(value.status === 'synced'){
					items.push(value);
				}else{
					items.unshift(value);
				}
			});
			$scope.list.items = items;
		});
		$scope.refresh = 0;
		$scope.actions = [
			{
				label: '添加新商品',
				class: 'btn-primary',
				onClick: addProduct
			},
			{
				label: '删除活动商品',
				class: 'btn-warning',
				onClick: removeProduct,
				checkDisabled: checkRemove
			}
		];
		$scope.setting = {add : '删除', added: '待删除', status: 'showNewPrice', pageStatus: 'manage'};

		$scope.addProduct 		= addProduct;
		$scope.removeProduct 	= removeProduct;
		$scope.checkRemove 		= checkRemove;
		$scope.updateProduct	= updateProduct;
		$scope.editPage 	 	= editPage;
		$scope.doEditActivityPage = doEditActivityPage;

		Activity.getActivity({id: $stateParams.activityId}).then(function(activity){
			$scope.data = activity;
			$scope.data.shopId = $scope.data.shop.id;
			if($scope.data.typeCode === 'taobaocommonitem') {
				$scope.actions.unshift({
					label: '修改商品',
					class: 'btn-primary',
					onClick: updateProduct
				});
			}
			var dt = new Date();
			if($scope.data.endTime < systemMath.convertToTime(dt) || $scope.data.status === 'close') {
				$scope.setting.showBtn = false;
			}
			if($scope.data.typeCode === 'taobaoitem'){
				$scope.limitCount = 50;
			}else {
				$scope.limitCount = 150;
			}
			if($scope.data.participateRangeCode === 'fullShop'){
				$scope.actions = {};
				$scope.setting.showBtn = false;
			}
			$scope.isBooting = false;
		});
		
		function addProduct() {
			$scope.$emit('setGlobalValues', {key: 'activityToAddProduct', value: $scope.data});
			$scope.$emit('setGlobalValues', {key: 'justAddProduct', value: true});
			switch($scope.data.typeCode) {
				case 'taobaocommonitem':
					$state.go('^.commonitem.addproducts');
					break;
				case 'taobaoitem': 
					$state.go('^.taobaoitem.addproducts');
					break;
				case 'taobaomjs': 
					$state.go('^.taobaomjs.addproducts');
					break;
			}
		}
		function removeProduct() {
			var params = {activityId: $scope.data.id, ids: []};
			if($scope.list.cacheStorage.keyCount > 0){
				angular.forEach($scope.list.cacheStorage.itemsToArray(), function(item){
					params.ids.push(item.id);
				});
				$scope.removing = true;
				ActivityProduct.removeAdded(params).then(function(data){
					$scope.removing = false;
					$scope.list.cacheStorage.removeAll();
					$state.reload();
				}, function(error){
					$scope.errorStatus = true;
					$scope.errorMessage = error.errorMessage;
					$scope.removing = false;
				});
			}
		}

		function updateProduct() {
			$state.go('^.commonitem.setdiscount', {activityId: $scope.data.id});
		}

		function checkRemove() {
			return ($scope.list.cacheStorage.keyCount <= 0 || $scope.removing);
		}

		$scope.$watch(function(){return $scope.currentTab}, function(newValue, oldValue){
			if(newValue !== oldValue) {
				if(newValue === 'pagesetting') {
					$scope.editPage();
				}
			}
		});

		function editPage() {
			$scope.qrcodeUrl = appConfig.activityUrl + '/activity/' + $stateParams.activityId + '/weitao';
		}

		function doEditActivityPage(pageData){
			$scope.isEdit  = true;
			$scope.successMessage = false;
			$scope.errorMessage   = false;
			pageData.activityId = $stateParams.activityId;
			if(pageData.isShowShopScore ==='false'){
				pageData.isShowShopScore = false;
			}
			ActivityPage.editPage(pageData).then(function(result){
				$scope.isEdit  = false;
				$scope.successMessage = '编辑成功!';
				$scope.refresh++;
			},function(error){
				$scope.isEdit  = false;
				$scope.errorMessage = error.errorMessage;
			});
		}

		$scope.closeAlert = function(){
			$scope.closeAlertStatus = false;
		}

		function getAdded(params) {
			if(angular.isObject){
				var config = angular.extend({}, params, {id: $stateParams.activityId});
			}
			return ActivityProduct.getAdded(config).then(function(data){
				var result = {items: [], total: data.total};
				angular.forEach(data.items, function(item){
					item.logo = item.picUrl;
					item.uniqueId = item.shop.app.platformCode + item.itemId;
					item.newPrice = parseFloat((item.price/100).toFixed(2));
					item.price =parseFloat((item.oldPrice/100).toFixed(2));
					if(item.activity.typeCode === 'taobaomjs') {
						$scope.setting.status = false;
						delete item.newPrice;
					}
					result.items.push(item);
				});
				return result;
			});
		}
	}
})(window.angular);