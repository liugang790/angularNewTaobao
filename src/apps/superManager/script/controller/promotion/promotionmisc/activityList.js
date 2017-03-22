(function(angular, undefined){'use strict';

	/**
	* 营销活动列表模块
	*/
	angular
		.module('promotionmisc.ActivityList',[])
		.config(Configure)
		.controller('ActivityListCtrl', ActivityListCtrl);

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider.state('member.promotion.promotionmisc.list', {
			url: '/list',
			templateUrl: '/template/promotion/promotionmisc/activityList.tpl.html',
			controller: 'ActivityListCtrl',
			resolve: {
				currentShop: /* @ngInject */function(Context){
					return Context.shop();
				}
			}
		})
	}

	/**
	* @ngInject
	*/
	function ActivityListCtrl($scope, $state, currentShop, listFactory, Activity, ActivityPoster, StorageFactory, systemMath, appInfo, $rootScope) {
		if(!currentShop) {
			$state.go('index');
		}
		$scope.currentShop = currentShop;
		$scope.closeStatus = {};
		$scope.clearStatus = {};
		$scope.deleteStatus = {};
		$scope.restartStatus = {};
		$scope.clearing = false;
		$scope.selectedActivities = [];
		if(appInfo.has('deadline')) {
			$scope.subscribeVer = appInfo.get('deadline').itemCode;
		}

		$scope.list = listFactory.$new(Activity.query);
		$scope.list.filterOptions.shopId = currentShop.id;
		$scope.list.filterOptions.status = 'unFinish';
		$scope.listMessages = {
			emptyTemplate:  '/template/promotion/promotionmisc/listEmpty.tpl.html'
		};

		$scope.listLoad 	= listLoad;
		$scope.toManage 	= toManage;
		$scope.addProduct 	= addProduct;
		$scope.close 		= close;
		$scope.editActivity = editActivity;
		$scope.updateProducts = updateProducts;
		$scope.setSharePlat   = setSharePlat;
		$scope.isShareWeitaoDisable = isShareWeitaoDisable;
		$scope.changeStatus   = changeStatus;
		$scope.isStatus       = isStatus;
		$scope.clearPoster	  = clearPoster;
		$scope.getShareTagName= getShareTagName;
		$scope.deleteActivity = deleteActivity;
		$scope.toggleSelected = toggleSelected;
		$scope.selecteAll     = selecteAll;
		$scope.restartActivity= restartActivity;

	    var previewModalInstance = false;
	    var qrcodeModalInstance = false;
	    var shareModalInstance = false;

		function isStatus(status) {
			return ($scope.list.filterOptions.status == status);
		}

		function changeStatus(status) {
			$scope.list.filterOptions.status = status;
			$scope.list.load();
		}

		function getShareTagName(activity) {
			var tags = [];
			angular.forEach($scope.shareTags, function(tag){
				if(activity.tags.indexOf(tag.code) !== -1){
					tags.push(tag);
				}
			});			return tags;
		}

	    function queryShops() {
	        return Shop.query().then(function(data) {
	            $scope.list.filterOptions.shopId = data.items[0].id;
	        });
	    }

	   	function isShareWeitaoDisable() {
			$scope.shareTimeStorage = StorageFactory.$new('sharetime');
	    	if($scope.shareTimeStorage.has('weitao')){
	    		var oldShareTime = $scope.shareTimeStorage.get('weitao');
	    		if(systemMath.checkSameDay(new Date(), oldShareTime)){
	    			$scope.weitaoNotify = '您今天已经分享过微淘了，请明天再来分享吧！（根据淘宝规则一天只能分享一次）';
	    			return true;
	    		}
	    	}
	    	return false;
	   	}

		$scope.share ={ispop : false};
		$scope.currentActivity = {};
	    function setSharePlat(plat, activity) {
			$scope.currentActivity = activity;
			$scope.share = {ispop : true, tabs : [plat,'preview']};
	    }

	    function restartActivity(data) {
	    	if($scope.subscribeVer === 'vip0') {
				$rootScope.popBuyLink('恭喜您获得一个红包', '仅需5元/月马上体验正式版！', 'http://tb.cn/6lGQlQx');
				return ;
			}
	    	if(data.typeCode === 'taobaoitem') {
	    		$state.go('member.promotion.promotionmisc.taobaoitem.restart', {activityId: data.id});
	    	}
	    	if(data.typeCode === 'taobaocommonitem') {
	    		$state.go('member.promotion.promotionmisc.commonitem.restart', {activityId: data.id});
	    	}
	    	if(data.typeCode === 'taobaomjs') {
	    		if(data.participateRangeCode === 'fullShop'){
	    			$state.go('member.promotion.promotionmisc.fullshopmjs.restart', {activityId: data.id});
	    		}else{
	    			$state.go('member.promotion.promotionmisc.taobaomjs.restart', {activityId: data.id});
	    		}
	    	}
	    }

		function defaultSummary(activity) {
			var startDate = new Date(activity.startTime * 1000);
			var endDate = new Date(activity.endTime * 1000);
			var summary = startDate.getFullYear() + '年' + (startDate.getMonth() + 1) + '月' + startDate.getDate() + '日到'
				+ endDate.getFullYear() + '年' + (endDate.getMonth() + 1) + '月' + endDate.getDate() + '日'
				+ activity.detail.priceTag;
			return summary;
		}
		
		function clearPoster(activity) {
			$scope.clearStatus[activity.id] = true;
			ActivityPoster.clearPoster({id: activity.id}).then(function(){
				$scope.clearStatus[activity.id] = false;
				$state.reload();
			}, function(error){
				$scope.clearStatus[activity.id] = false;
				popError(error.errorMessage);
			});
		}

		function selecteAll(status) {
			$scope.selectedActivities = [];
			if(status) {
				angular.forEach($scope.list.items, function(item){
					item.selected = true;
					$scope.selectedActivities.push(item);
				});
			}else{
				angular.forEach($scope.list.items, function(item){
					item.selected = false;
				});
			}
		}

		function deleteActivity(data) {
			if($scope.subscribeVer === 'vip0') {
				$rootScope.popBuyLink('恭喜您获得一个红包', '仅需5元/月马上体验正式版！', 'http://tb.cn/6lGQlQx');
				return ;
			}
			var ids = [];
			if(data !== null && data !== undefined) {
				ids.push(data.id);
			}else{
				angular.forEach($scope.selectedActivities, function(value){
					ids.push(value.id);
					$scope.deleteStatus[value.id] = true;
				});
			}
			Activity.deleteActivity({ids:ids}).then(function(){
				$state.reload();
			}, function(error){
				popError(error.errorMessage);
			});
		}

		function toggleSelected(data) {
			if(data.selected) {
				$scope.selectedActivities.push(data);
			}else{
				$scope.selectedActivities.filter(function(value){
					return value.id !== data.id;
				});
			}
		}

		function listLoad(listStatus) {
			$scope.list.filterOptions.status = listStatus;
			$scope.list.load();
		}

		function toManage(activity, tabCode) {
			$state.go('member.promotion.promotionmisc.manage', {activityId: activity.id, tab: tabCode});
		}

		function addProduct(activity) {
			$scope.$emit('setGlobalValues', {key: 'activityToAddProduct', value: activity});
			$scope.$emit('setGlobalValues', {key: 'justAddProduct', value: true});
			switch(activity.typeCode) {
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

		function editActivity(data) {
			switch(data.typeCode) {
				case 'taobaocommonitem':
					$state.go('^.commonitem.edit', {activityId: data.id});
					break;
				case 'taobaoitem':
					$state.go('^.taobaoitem.edit', {activityId: data.id});
					break;
				case 'taobaomjs':
					$state.go('^.taobaomjs.edit', {activityId: data.id});
					break;
			}
		}

		function updateProducts(data) {
			$state.go('^.commonitem.setdiscount', {activityId: data.id});
		}

		function close(data) {
			$scope.closeStatus[data.id] = true;
	    	$scope.closeActivity = data;
	    	$.confirm({
	    		title: '结束活动确认',
	    		body: '是否要结束活动？',
	    		okBtn: '确认',
	    		cancleBtn: '取消',
	    		closeBtn: true,
	    		width: 200,
	    		height: 100,
	    		okHidden: doClose
	    	});
	    }

	    function doClose() {
	    	$scope.isClosing = true;
	    	Activity.closeActivity({id: $scope.closeActivity.id}).then(function(data){
	    		$scope.closeStatus[data.id] = false;
	    		$scope.isClosing = false;
	    		$scope.list.load();
	    	}, function(error){
	    		$scope.closeStatus = false;
	    		popError(error.errorMessage);
	    	});
	    }

	    function popError(msg) {
	    	$.alert({
	    		title: '错误提示',
	    		body: msg
	    	});
	    }
	}
})(window.angular);