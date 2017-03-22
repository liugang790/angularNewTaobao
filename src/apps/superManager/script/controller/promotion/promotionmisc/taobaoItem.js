(function(angular, undefined){
	/**
	* 全店商品折扣/减价模块
	*/
	angular
		.module('promotionmisc.TaobaoItem', [])
		.config(Configure)
		.controller('TaobaoItemMainCtrl', TaobaoItemMainCtrl)
		.controller('TaobaoItemCreateCtrl', TaobaoItemCreateCtrl)
		.controller('TaobaoItemProductsCtrl', TaobaoItemProductsCtrl)
		.controller('TaobaoItemEditCtrl', TaobaoItemEditCtrl)
		.service('TaobaoitemService', TaobaoitemService)
	;

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider
			.state('member.promotion.promotionmisc.taobaoitem', {
				url: '/taobaoitem',
				parent: 'member.promotion.promotionmisc',
				views: {
					"": {
						template: '<div ui-view="taobaoitem"></div>',
						controller: 'TaobaoItemMainCtrl'
					}
				},
				resolve: {
					currentShop: /* @ngInject */function(Context){
						return Context.shop();
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaoitem.create', {
				url: '/create',
				parent: 'member.promotion.promotionmisc.taobaoitem',
				views: {
					'taobaoitem': {
						templateUrl: '/template/promotion/promotionmisc/taobaoitem/create.tpl.html',
						controller: 'TaobaoItemCreateCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaoitem.edit', {
				url:'/edit/:activityId',
				parent: 'member.promotion.promotionmisc.taobaoitem',
				views: {
					'taobaoitem': {
						templateUrl: '/template/promotion/promotionmisc/taobaoitem/create.tpl.html',
						controller: 'TaobaoItemEditCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaoitem.addproducts', {
				url: '/add-products',
				parent: 'member.promotion.promotionmisc.taobaoitem',
				views: {
					'taobaoitem': {
						templateUrl: '/template/promotion/promotionmisc/taobaoitem/products.tpl.html',
						controller: 'TaobaoItemProductsCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaoitem.restart', {
				url: '/restart/:activityId',
				parent: 'member.promotion.promotionmisc.taobaoitem',
				views: {
					'taobaoitem': {
						templateUrl: '/template/promotion/promotionmisc/taobaoitem/create.tpl.html',
						controller: 'TaobaoItemCreateCtrl'
					}
				}
			})
		;
	}

	function TaobaoitemService() {
		var service = this;
		this.systemStags = ['限时促销','限时抢购','新品上市','春装首发'];
		this.participateRanges = [
			{range: 0, name: '全部商品'},
			{range: 1, name: '部分商品'}
		];
		this.promotionTypes = [
			{code: 1, name: '打折'},
			{code: 0, name: '减价'}
		];

		function getSystemTags() {
			return service.systemStags;
		}
		function getParticipateRanges() {
			return service.participateRanges;
		}
		function getPromotionTypes() {
			return service.promotionTypes;
		}
		return {
			getSystemTags: getSystemTags,
			getParticipateRanges: getParticipateRanges,
			getPromotionTypes: getPromotionTypes
		};
	}

	/**
	* @ngInject
	*/
	function TaobaoItemMainCtrl($scope, currentShop, appInfo) {
		$scope.currentShop = currentShop;
		$scope.globalData = {};
		$scope.$on('setTaobaoitemValue', function(event, obj){
			$scope.globalData[obj.key] = obj.value;
		});
		$scope.$on('setTaobaoitemProductByUniqueId', function(event, obj){
			$scope.globalData.productsInbox.forEach(function(item){
				if(item.uniqueId === obj.uniqueId) {
					item = obj.value;
				}
			});
		});
		if(!appInfo.get('deadline') || !$scope.currentShop) {
			$state.go('index');
		}
		$scope.itemCode = appInfo.get('deadline').itemCode;
	}

	/**
	* @ngInject
	*/
	function TaobaoItemCreateCtrl($scope, $state, TaobaoitemService, auth, $stateParams, Activity, systemMath, stepsFactory, appInfo, $rootScope, ActivityProduct) {
		var dt = new Date();
		$scope.steps = stepsFactory.$new({labels: ['设置活动基本信息'], currentStep: 1});
		$scope.stepLabels = ['设置活动基本信息'];
		if($state.current.name === 'member.promotion.promotionmisc.taobaoitem.edit') {
			$scope.steps.setLables(['修改活动基本信息']);
			$scope.steps.refresh();
		}
		if(appInfo.has('deadline')) {
			$scope.subscribeVer = appInfo.get('deadline').itemCode;
		}
		$scope.participateRanges = TaobaoitemService.getParticipateRanges();
		$scope.promotionTypes = TaobaoitemService.getPromotionTypes();
		$scope.systemTags = TaobaoitemService.getSystemTags();
		
		$scope.data = {
			typeCode 	: 'taobaoitem',
			shopId		: auth.getAdapter().getData().bindTokens[0], 
			title 		: '全店优惠活动'+dt.getFullYear()+(dt.getMonth()+1)+dt.getDate()+systemMath.getRandomInt(100, 1000),
			startTime: systemMath.toDateString(new Date()),
			endTime: systemMath.toDateString(new Date(dt.setDate(dt.getDate() + 7))),
			priceTag 	: $scope.systemTags[0],
			showPriceTag : true,
			participateRange: $scope.participateRanges[0].range,
			promotionType: $scope.promotionTypes[0].code,
			promotionValue: 9
		};
		if($stateParams.activityId){
			$scope.participateDisabled = true;
			if($state.current.name === 'member.promotion.promotionmisc.taobaoitem.restart') {
				$scope.$emit('setTaobaoitemValue', {key: 'restart', value: true});
			}
			Activity.getActivity({id: $stateParams.activityId}).then(function(data){
				if($scope.globalData.restart) {
					data.title = '[重开]'+data.title;
					data.startTime = systemMath.toDateString(new Date());
					data.endTime = systemMath.toDateString(new Date(dt.setDate(dt.getDate() + 7)));
				}else{
					data.startTime = systemMath.toDateString(new Date(data.startTime * 1000));
					data.endTime = systemMath.toDateString(new Date(data.endTime * 1000));
				}
				$scope.data = data;
				$scope.data.priceTag = data.detail.priceTag;
				$scope.data.participateRange = (data.participateRangeCode === 'fullShop') ? 0 : 1;
				$scope.data.promotionType = data.detail.promotionType;
				$scope.data.promotionValue = data.detail.promotionValue/100;
			});
		}
		if($scope.data.promotionType === 0) {
			$scope.typeName = '减价';
		}else {
			$scope.typeName = '打折';
		}
		$scope.rangeName = '全店商品';

		$scope.popHelpStatus = false;
		$scope.isWholeShop 			= isWholeShop;
		$scope.isDiscount 			= isDiscount;
		$scope.upsertActivity 		= upsertActivity;
		$scope.sureClick 			= sureClick;

		function isWholeShop() {
			if($scope.data.participateRange === 1) {
				if($scope.stepLabels.length === 1) {
					$scope.stepLabels.push('选择活动商品');
					$scope.steps.setLables($scope.stepLabels);
					$scope.steps.refresh();
				}
				return false;
			}else{
				if($scope.stepLabels.length > 1){
					$scope.stepLabels.pop();
					$scope.steps.setLables($scope.stepLabels);
					$scope.steps.refresh();
				}
				return true;
			}
		}
		function isDiscount() {
			return ($scope.data.promotionType !== 0);
		}

		function formatData() {
			var activityData = angular.extend({}, $scope.data);
			var startTime = systemMath.convertToTime($scope.data.startTime);
			var endTime = systemMath.convertToTime($scope.data.endTime);
			var dt = new Date();
			if(endTime < startTime) {
				$scope.errorMessage = '当前活动设置时间有误，请检查！';
				return false;
			}
			if(!angular.isUndefined($scope.subscribeVer) && $scope.subscribeVer == 'vip0') {
				if((endTime - startTime) > 60*60*24*7) {
					$scope.errorMessage = '试用版创建活动时间只能在7天内选择';
					$rootScope.popBuyLink('恭喜您获得一个红包', '试用版只能创建7天内的折扣活动，请升级至标准版，标准版可以不限时间设置', 'http://tb.cn/6lGQlQx');
					return false;
				}
			}
			activityData.startTime = startTime;
			activityData.endTime = endTime;
			activityData.promotionValue = parseInt($scope.data.promotionValue * 100);
			return activityData;
		}

		function upsertActivity() {
			if(popMinDiscount()) {
				$rootScope.minDiscountSet();
				$scope.popHelpStatus = true;
				$rootScope.sureClickCallBack = doUpsert;
			}else {
				doUpsert();
			}
		}

		function doUpsert() {
			var activityData = formatData();
			if(!activityData) {
				return false;
			}
			$scope.upserting = true;
			var promise;
			if($scope.globalData.restart === true) {
				promise = Activity.restartActivity(activityData);
			}else{
				promise = Activity.upsertActivity(activityData);
			}
			promise.then(function(data){
				$scope.upserting = false;
				if(isWholeShop()) {
					$scope.$emit('setTaobaoitemValue', {key: 'baseInfo', value: null});
					if($scope.globalData.restart === true) {
						$state.go('member.promotion.promotionmisc.success', {activityId: data.id, status: 'restart'});	
					}else {
						$state.go('member.promotion.promotionmisc.success', {activityId: data.id, status: 'create'});	
					}
				}else {
					$scope.$emit('setTaobaoitemValue', {key: 'baseInfo', value: data});
					$state.go('member.promotion.promotionmisc.taobaoitem.addproducts');
				}
			},function(error){
				$scope.upserting = false;
				$scope.errorMessage = error.errorMessage;
				if($scope.errorMessage.indexOf('试用版只能创建1个活动') !== -1) {
					$rootScope.popBuyLink('恭喜您获得一个红包', '试用版只能创建一个活动，请升级到标准版', 'http://tb.cn/6lGQlQx');
				}
			});
		}

		$scope.restartNow = function() {
			var activityData = formatData();
			if(!activityData) {
				return false;
			}
			$scope.restarting = true;
			Activity.restartActivity(activityData).then(function(newActivity){
				if(isWholeShop()) {
					$scope.restarting = false;
					$state.go('member.promotion.promotionmisc.success', {activityId: newActivity.id, status: 'restart'});	
					$scope.$emit('setTaobaoitemValue', {key: 'restart', value: false});
				}else {
					ActivityProduct.getAdded({id: activityData.id}).then(function(addedProducts){
						var ids = [];
						var params = {'activityId': newActivity.id, 'items':[]};
						addedProducts.items.forEach(function(item){
							ids.push(item.itemId);
							params.items.push({
								title: item.title,
				    			picUrl: item.picUrl,
				    			itemId: item.itemId,
				    			price: item.price
							});
						});
						ActivityProduct.deleteProduct({ids: ids}).then(function(response){
		    				ActivityProduct.add(params).then(function(result){
		    					$scope.restarting = false;
		    					$state.go('member.promotion.promotionmisc.success', {activityId: newActivity.id, status: 'restart'});
		    				});
		    			}, function(error){
							$scope.errorMessage = '添加活动商品失败：' + error.errorMessage;
							$scope.restarting = false;
						});
					}, function(error){
						$scope.errorMessage = '获取活动商品失败：' + error.errorMessage;
						$scope.restarting = false;
					});
				}
			}, function(error){
				$scope.errorMessage = '重启活动失败：' + error.errorMessage;
				$scope.restarting = false;
			});
		}

		function sureClick(popHelpNeverStatus) {
            $scope.closePop(popHelpNeverStatus);
            $scope.sureClickCallBack();
        }

		function popMinDiscount() {
			return (isDiscount() && $scope.data.promotionValue < 7 && !$rootScope.popHelpNeverStatus && !$scope.popHelpStatus);
		}
	}

	/**
	* @ngInject
	*/
	function TaobaoItemProductsCtrl($scope, $state, listFactory, ActivityProduct, stepsFactory) {
		$scope.steps = stepsFactory.$new({labels: ['设置活动基本信息', '选择活动商品'], currentStep: 2});
		$scope.name = 'taobaoItem';
	    $scope.alllimitCounts = 50;
	    
	    if($scope.globals.justAddProduct) {
	    	$scope.activity = $scope.globals.activityToAddProduct;
	    }else {
	    	$scope.activity = $scope.globalData.baseInfo;
	    }
	    
		$scope.limitCounts = $scope.alllimitCounts - ($scope.activity.addedTotal ? $scope.activity.addedTotal : 0);
		$scope.productsInbox = $scope.globalData.productsInbox;

		$scope.productList = listFactory.$new(ActivityProduct, {ns:'discountActivityProductsInbox'});
		$scope.productList.filterOptions = {
			shopId: $scope.activity.shop.id
		};
		$scope.setting = {hideOrder : false};
		if($scope.productsInbox && $scope.productsInbox.length > 0) {
			$scope.productList.addLoadCallback(function(){
				$scope.productsInbox.forEach(function(value){
					$scope.productList.cacheStorage.put(value.uniqueId, value);
				});
			});
		}
		if($scope.globalData.restart === true) {
			$scope.productList.addLoadCallback(function(){
				ActivityProduct.getAdded({id: $scope.activity.id}).then(function(addedProducts){
					$scope.addedProducts = addedProducts.items;
					for(var i =0; i< addedProducts.items.length; i++) {
						//for (var j = 0; j < $scope.productList.items.length; j++) {
							//if(addedProducts.items[i].itemId === $scope.productList.items[j].source.wareId) {
								addedProducts.items[i].logo = addedProducts.items[i].picUrl;
								$scope.productList.cacheStorage.put('taobao'+addedProducts.items[i].itemId, addedProducts.items[i]);
							//}
						//}
					}
				});
			});
			$scope.setting['showBtn'] = true;
		}
	    
	    $scope.listActions = [
	    	{
	    		label: '上一步',
	    		icons: 'iconfont icon-houtuiyibu',
	    		class: 'btn-default',
	    		onClick: backEdit
	    	},
	    	{
	    		label: '提交活动商品',
	    		class: 'btn-success',
	    		onClick: create,
	    		checkDisabled: check
	    	}
	    ];

	    function backEdit() {
	    	$scope.$emit('setTaobaoitemValue', {key: 'productsInbox', value: $scope.productList.cacheStorage.itemsToArray()});
	    	$state.go('member.promotion.promotionmisc.taobaoitem.edit', {activityId: $scope.activity.id});
	    	$scope.productList.cacheStorage.removeAll();
	    }

	    function create() {
	    	var params = {
	    		activityId: $scope.activity.id,
	    		items: []
	    	};
	    	var deletedProducts = [];
	    	var reAddedProducts = {};
	    	$scope.creating = true;
	    	$scope.productsInbox = $scope.productList.cacheStorage.itemsToArray();
	    	angular.forEach($scope.productsInbox, function(item, key){
	    		var itemId;
	    		if(item.source) {
	    			itemId = item.source.wareId;
	    		}else {
	    			itemId = item.itemId;
	    		}
	    		var temp = {
	    			title: item.title,
	    			picUrl: item.logo,
	    			itemId: itemId,
	    			price: item.price
	    		};
	    		params.items.push(temp);
	    		if($scope.event === 'restart') {
	    			angular.forEach($scope.addedProducts, function(added){
		    			if(added.itemId === itemId) {
		    				reAddedProducts[added.itemId] = added;
		    			}
		    		});
	    		}
	    	});
	    	if($scope.globalData.restart === true) {
	    		var deleteIds = [];
		    	angular.forEach($scope.addedProducts, function(added){
		    		if(!reAddedProducts[added.itemId]) {
		    			deleteIds.push(added.id);
		    			deletedProducts.push(added);
		    		}
		    	});
		    	if(deletedProducts.length > 0) {
		    		ActivityProduct.deleteProduct({ids: deleteIds}).then(function(response){
		    			doProductAdd(params);
		    		});
		    	}
		    	$scope.$emit('setTaobaoitemValue', {key: 'restart', value: false});
	    	}else {
	    		doProductAdd(params);
	    	}
	    	
	    }

	    function doProductAdd(params) {
	    	ActivityProduct.add(params).then(function(data){
	    		$scope.creating = false;
				$scope.$emit('setTaobaoitemValue', {key: 'baseInfo', value: null});
				$scope.$emit('setTaobaoitemValue', {key: 'productsInbox', value: []});
				$scope.productList.cacheStorage.removeAll();
				if($scope.globals.justAddProduct) {
					$scope.$emit('setGlobalValues', {key: 'activityToAddProduct', value: null});
					$scope.$emit('setGlobalValues', {key: 'justAddProduct', value: false});
				}
				$state.go('member.promotion.promotionmisc.success', {activityId: params.activityId, status: 'create'});
			});
	    }

	    function check() {
	    	if($scope.productList.cacheStorage.keyCount > $scope.limitCounts) {
	    		if($scope.limitCounts < $scope.alllimitCounts) {
	    			$scope.errorMessage = '活动已添加'+($scope.alllimitCounts-$scope.limitCounts)+'个商品，活动商品总数不能超过50个！';
	    		}else {
	    			$scope.errorMessage = '活动商品数量不能超过50个！';
	    		}
	    		$scope.errorStatus = true;
	    	}else{
	    		$scope.errorStatus = false;
	    	}
	    	return ($scope.productList.cacheStorage.keyCount < 1 || $scope.productList.cacheStorage.keyCount > $scope.limitCounts || $scope.creating);
	    }
	}

	/**
	* @ngInject
	*/
	function TaobaoItemEditCtrl($scope, $state, TaobaoitemService, $stateParams, $rootScope, Activity, systemMath, $rootScope) {
		$scope.editPage = true;
		$scope.promotionTypes = TaobaoitemService.getPromotionTypes();
		$scope.participateDisabled = true;
		$scope.popHelpStatus = false;
		$scope.systemTags = TaobaoitemService.getSystemTags();

		Activity.getActivity({id: $stateParams.activityId}).then(function(data){
			$scope.data = data;
			$scope.data.startTime = systemMath.toDateString(new Date(data.startTime * 1000));
			$scope.data.endTime = systemMath.toDateString(new Date(data.endTime * 1000));
			$scope.data.priceTag = $scope.data.detail.priceTag;
			$scope.data.participateRange = ($scope.data.participateRangeCode === 'fullShop') ? 0 : 1;
			$scope.data.promotionType = $scope.data.detail.promotionType;
			$scope.typeName = ($scope.data.promotionType===0) ? '减价' : '打折';
			$scope.data.promotionValue = $scope.data.detail.promotionValue/100;

			$scope.isWholeShop = $scope.data.isFullShop; 
		});
		var activityData = {};

		$scope.submitEdit = submitEdit;
		$scope.isDiscount = isDiscount;

		function submitEdit() {
			activityData = angular.extend({}, $scope.data);
			activityData.startTime = systemMath.convertToTime($scope.data.startTime);
			activityData.endTime = systemMath.convertToTime($scope.data.endTime);
			activityData.promotionValue = parseInt($scope.data.promotionValue * 100);
			if(popMinDiscount()){
				$rootScope.minDiscountSet();
				$scope.popHelpStatus = true;
				$rootScope.sureClickCallBack = doEdit;
			}else {
				doEdit();
			}
		}

		function doEdit() {
			$scope.editing = true;
			Activity.upsertActivity(activityData).then(function(data){
				$scope.editing = false;
				$state.go('member.promotion.promotionmisc.list');
			}, function(error){
				$scope.editing = false;
				$scope.errorMessage = error.errorMessage;
			});
		}

		function popMinDiscount() {
			return (isDiscount() && $scope.data.promotionValue < 7 && !$rootScope.popHelpNeverStatus && !$scope.popHelpStatus);
		}

		function isDiscount() {
			return ($scope.data.promotionType !== 0);
		}
	}
})(window.angular);