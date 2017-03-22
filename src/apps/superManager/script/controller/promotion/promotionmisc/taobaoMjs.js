(function(angular, undefined){'use strict';
	/**
	* 淘宝满就送活动控制器
	*/
	angular
		.module('promotionmisc.TaobaoMjs', [])
		.controller('TaobaomjsMainCtrl', TaobaomjsMainCtrl)
		.controller('TaobaomjsCreateCtrl', TaobaomjsCreateCtrl)
		.controller('TaobaomjsEditCtrl', TaobaomjsEditCtrl)
		.controller('TaobaomjsProductsCtrl', TaobaomjsProductsCtrl)
		.controller('TaobaomjsDetailCtrl', TaobaomjsDetailCtrl)
		.constant('mjsPosters', [
			{tplName: 'mjsPoster1', name: '横幅1', dir: "/template/activity/poster/mjsPoster1.tpl.html"},
			{tplName: 'mjsPoster2', name: '横幅2', dir: "/template/activity/poster/mjsPoster2.tpl.html"},
			{tplName: 'mjsPoster3', name: '横幅3', dir: "/template/activity/poster/mjsPoster3.tpl.html"}
		])
		.constant('MjsStepLabels', ['设置活动基本信息','选择活动商品','设置活动详情'])
	;
	/**
	* @ngInject
	*/
	function TaobaomjsMainCtrl($scope, $state, currentShop, appInfo) {
		$scope.currentShop = currentShop;
		$scope.globalData = {};
		$scope.$on('setMjsValue', function(event, obj){
			$scope.globalData[obj.key] = obj.value;console.log($scope.globalData);
		});
		$scope.$on('setMjsProductByUniqueId', function(event, obj){
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
	function TaobaomjsCreateCtrl($scope, $state, mjsPosters, $rootScope, auth, participateRange, appInfo, $stateParams, Activity, stepsFactory, MjsStepLabels, systemMath, ActivityProduct, ActivityPoster) {
		$scope.mjsPosters = mjsPosters;
		$scope.participateRange = participateRange;
		$scope.systemTags = ['满减促销','满就包邮', '满就送礼'];
		$scope.$emit('setMjsValue', {key: 'event', value: 'create'});
		if(appInfo.has('deadline')) {
			$scope.subscribeVer = appInfo.get('deadline').itemCode;
		}
		
		switch($state.current.name) {
			case 'member.promotion.promotionmisc.taobaomjs.create': 
				$scope.participateRange = 1;
				$scope.steps = stepsFactory.$new({labels: MjsStepLabels, currentStep: 1});
				break;
			case 'member.promotion.promotionmisc.fullshopmjs.create':
				$scope.participateRange = 0;
				$scope.mjsStepLabels = ['设置活动基本信息','设置活动详情'];
				$scope.steps = stepsFactory.$new({labels: $scope.mjsStepLabels, currentStep: 1});
				break;
		}
		
		var dt = new Date();
		var defaultData = {
			typeCode: 'taobaoMjs',
			shopId: auth.getAdapter().getData().bindTokens[0],
			title: '满就送活动'+dt.getFullYear()+(dt.getMonth()+1)+dt.getDate()+systemMath.getRandomInt(100, 1000),
			startTime: systemMath.toDateString(new Date()),
			endTime: systemMath.toDateString(new Date(dt.setDate(dt.getDate() + 7))),
			priceTag: '满减促销',
			taobaoType: 2,
			participateRange: participateRange
		};
		if($scope.participateRange === 0 && $scope.globalData.fullshopmjsData) {
			$scope.data = $scope.globalData.fullshopmjsData;
		}else if($scope.participateRange === 1 && $scope.globalData.mjsData) {
			$scope.data = $scope.globalData.mjsData;
		}else {
			$scope.data = defaultData;
		}

		if($stateParams.activityId && $state.current.name.indexOf('restart') != -1) {
			$scope.$emit('setMjsValue', {key: 'restart', value: true});
			Activity.getActivity({id: $stateParams.activityId}).then(function(data){
				data.title = '[重开]'+data.title;
				data.startTime = systemMath.toDateString(new Date());
				data.endTime = systemMath.toDateString(new Date(dt.setDate(dt.getDate() + 7)));
				$scope.data = data;
				$scope.data.priceTag = data.detail.priceTag;
				$scope.data.taobaoType = data.detail.taobaoType;
				$scope.data.participateRange = data.detail.participateRange;
				$scope.data.shopId = data.shop.id;
			});
		}
		
		$scope.setDetail 	= setDetail;
		$scope.addProducts 	= addProducts;
		$scope.doCreate 	= doCreate;
		$scope.restartNow 	= restartNow;

		function formatData() {
			var startTime = systemMath.convertToTime($scope.data.startTime);
			var endTime = systemMath.convertToTime($scope.data.endTime);
			var dt = new Date();
			if(endTime < startTime) {
				$scope.errorMessage = '当前活动设置时间有误，请检查！';
				return ;
			}
			if(!angular.isUndefined($scope.subscribeVer) && $scope.subscribeVer == 'vip0') {
				if((endTime - startTime) > 60*60*24*7) {
					$scope.errorMessage = '试用版创建活动时间只能在7天内选择';
					$rootScope.popBuyLink('恭喜您获得一个红包', '试用版只能创建7天内的折扣活动，请升级至标准版，标准版可以不限时间设置', 'http://tb.cn/6lGQlQx');
					return ;
				}
			}
			$scope.data.startTime = startTime;
			$scope.data.endTime = endTime;
		}
		function doCreate() {
			if($scope.participateRange === 0) {
				setDetail();
			}else{
				addProducts();
			}
		}

		function setDetail() {
			formatData();
			var kvalue = ($scope.participateRange === 0) ? 'fullshopmjsData' : 'mjsData';
			$scope.$emit('setMjsValue', {key: kvalue, value: $scope.data});
			$state.go('^.setdetail');
		}

		function addProducts() {
			formatData();
			var kvalue = ($scope.participateRange === 0) ? 'fullshopmjsData' : 'mjsData';
			$scope.$emit('setMjsValue', {key: kvalue, value: $scope.data});
			$state.go('^.addproducts');
		}

		function restartNow() {
			formatData();
			angular.forEach($scope.data.detail, function(value, key){
				$scope.data[key] = value;
			});
			$scope.restarting = true;
			ActivityProduct.getAdded({id: $scope.data.id}).then(function(addedProducts){
				$scope.addedProducts = addedProducts.items;
				ActivityPoster.queryPoster({id: $scope.data.id}).then(function(result){
					$scope.data.posterData = result.poster;
					var posterParams = result.poster;
					Activity.restartActivity($scope.data).then(function(newActivity){
						posterParams.id = newActivity.id;
						if($scope.participateRange == 0) {
							posterParams.itemIds = [];
							createPoster(posterParams);
						}else {
							var ids = [];
							var addParams = {activityId: newActivity.id, items: []};
							$scope.addedProducts.forEach(function(item){
								ids.push(item.itemId);
								addParams.items.push({
									itemId: item.itemId,
									picUrl: item.picUrl,
									title: item.title,
									price: item.price,
								});
							});
							ActivityProduct.deleteProduct({ids: ids}).then(function(){
								ActivityProduct.add(addParams).then(function(){
									posterParams.itemIds = ids;
									createPoster(posterParams);
								}, function(error){
									$scope.errorMessage = '添加活动商品失败：' + error.errorMessage;
									$scope.restarting = false;
								});
							});
						}
					}, function(error){
						$scope.errorMessage = '重启活动失败：' + error.errorMessage;
						$scope.restarting = false;
					});
				});
			});
		}

		function createPoster(params) {
			ActivityPoster.createPoster(params).then(function(response){
				$scope.restarting = false;
				$state.go('member.promotion.promotionmisc.success', {activityId: params.id, status: 'restart'});
				$scope.$emit('setMjsValue', {key: 'restart', value: false});
			}, function(error){
				$scope.errorMessage = '添加活动海报失败：'+error.errorMessage;
				$scope.restarting = false;
			});
		}
	}

	/**
	* @ngInject
	*/
	function TaobaomjsProductsCtrl($scope, $state, listFactory, ActivityProduct, auth) {
		$scope.name = 'taobaoMjs';
		$scope.alllimitCounts = 150;
		
		if($scope.globals.justAddProduct) {
	    	$scope.activity = $scope.globals.activityToAddProduct;
	    }else {
	    	$scope.activity = $scope.globalData.mjsData;
	    }

	    if(!angular.isUndefined($scope.activity.id) && !angular.isUndefined($scope.activity.detail)){
		    $scope.activity.participateRange = ($scope.activity.participateRangeCode === 'fullShop') ? 0 : 1;
	    	angular.forEach($scope.activity.detail, function(value, key){
	    		$scope.activity[key] = value;
	    	});
		    delete $scope.activity.detail;
	    }
		$scope.limitCounts = $scope.alllimitCounts - ($scope.activity.addedTotal>0 ? $scope.activity.addedTotal : 0);
		$scope.productList = listFactory.$new(ActivityProduct, {ns:'discountActivityProductsInbox'});
		$scope.productList.filterOptions = {
			shopId: auth.getAdapter().getData().bindTokens[0]
		};
		$scope.setting = {hideOrder : false};
		$scope.productsInbox = $scope.globalData.productsInbox;
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
	    		class: 'btn-default',
	    		icons: 'sui-icon icon-arrow-left',
	    		onClick: backEdit
	    	},
	    	{
	    		label: '提交活动商品',
	    		class: 'btn-success',
	    		onClick: addProducts,
	    		checkDisabled: check
	    	}
	    ];
	    
	    $scope.check = check;
	    $scope.addProducts = addProducts;

	    function backEdit() {
	    	$scope.$emit('setMjsValue', {key: 'mjsData', value: $scope.activity});
	    	$scope.$emit('setMjsValue', {key: 'productsInbox', value: $scope.productList.cacheStorage.itemsToArray()});
	    	$scope.productList.cacheStorage.removeAll();
	    	$state.go('^.create');
	    }

	    function addProducts() {
	    	if($scope.globalData.restart === true) {
	    		var deletedProducts = [];
	    		var reAddedProducts = {};
	    		var reAddedIds = [];
	    		$scope.productsInbox = $scope.productList.cacheStorage.itemsToArray();
	    		angular.forEach($scope.productsInbox, function(item, key){
	    			var itemId;
		    		if(item.source) {
		    			itemId = item.source.wareId;
		    		}else {
		    			itemId = item.itemId;
		    		}
	    			angular.forEach($scope.addedProducts, function(added){
		    			if(added.itemId === itemId) {
		    				reAddedProducts[added.itemId] = added;
		    				reAddedIds.push(added.id);
		    			}
		    		});
	    		});
	    		var deleteIds = [];
		    	angular.forEach($scope.addedProducts, function(added){
		    		if(!reAddedProducts[added.itemId]) {
		    			deleteIds.push(added.id);
		    			deletedProducts.push(added);
		    		}
		    	});
		    	$scope.$emit('setMjsValue', {key: 'deleteIds', value: deleteIds});
		    	$scope.$emit('setMjsValue', {key: 'reAddedIds', value: reAddedIds});
	    	}
	    	$scope.$emit('setMjsValue', {key: 'mjsData', value: $scope.activity});
	    	$scope.$emit('setMjsValue', {key: 'productsInbox', value: $scope.productList.cacheStorage.itemsToArray()});
	    	$scope.productList.cacheStorage.removeAll();
	    	if($scope.globals.justAddProduct) {
				$scope.$emit('setGlobalValues', {key: 'activityToAddProduct', value: null});
				$scope.$emit('setGlobalValues', {key: 'justAddProduct', value: false});
			}
	    	$state.go('^.setdetail');
	    }

	    function check() {
	    	if($scope.productList.cacheStorage.keyCount > $scope.limitCounts){
	    		if($scope.limitCounts < $scope.alllimitCounts) {
	    			$scope.errorMessage = '活动已添加'+($scope.alllimitCounts-$scope.limitCounts)+'个商品，活动商品总数不能超过150个！';
	    		}else {
	    			$scope.errorMessage = '活动商品数量不能超过150个！';
	    		}
	    	}else{
	    		$scope.errorMessage = false;
	    	}
	    	return ($scope.productList.cacheStorage.keyCount < 1 || $scope.productList.cacheStorage.keyCount > $scope.limitCounts ||$scope.creating);
	    }
	}

	/**
	* @ngInject
	*/
	function TaobaomjsDetailCtrl($scope, $state, MjsStepLabels, stepsFactory, systemMath, $rootScope, Activity, ActivityProduct, ActivityPoster) {
		$scope.stepLabels = MjsStepLabels;
		switch($state.current.name) {
			case 'member.promotion.promotionmisc.taobaomjs.setdetail': 
				$scope.participateRange = 1;
				$scope.steps = stepsFactory.$new({labels: MjsStepLabels, currentStep: 3});
				$scope.activity = $scope.globalData.mjsData;
				break;
			case 'member.promotion.promotionmisc.fullshopmjs.setdetail':
				$scope.participateRange = 0;
				delete $scope.stepLabels[1];
				$scope.steps = stepsFactory.$new({labels: $scope.stepLabels, currentStep: 2});
				$scope.activity = $scope.globalData.fullshopmjsData;
				break;
		}

		$scope.popHelpStatus = false;
		var modalInstance = false;
		if(!angular.isUndefined($scope.activity.shop)) {
			$scope.activity.shopId = $scope.activity.shop.id;
		}

		$scope.create 		= create;
		$scope.stepTwo 		= stepTwo;
		$scope.tabActions = {
			formatTab: function(){},
			setPoster: function(code){}
		};

		function stepTwo() {
			$scope.tabActions.formatTab();
			if($scope.activity.participateRange === 0){
				$scope.$emit('setMjsValue', {key: 'fullshopmjsData', value: $scope.activity});
				if($scope.globalData.restart) {
					$state.go('^.restart', {activityId: $scope.activity.id});
				}else {
					$state.go('^.create');
				}
			}else{
				$scope.$emit('setMjsValue', {key: 'mjsData', value: $scope.activity});
				$state.go('^.addproducts');
			}
		}

		function create() {
			$scope.tabActions.formatTab();
			if(popMinDiscount()) {
				$rootScope.minDiscountSet();
				$scope.popHelpStatus = true;
				$rootScope.sureClickCallBack = doCreate;
			}else {
			 	doCreate();	
			}
		}

		function doCreate() {
			$scope.tabActions.setPoster();
			$scope.creating = true;
			var promise;
			if($scope.globalData.restart === true) {
				promise = Activity.restartActivity($scope.activity);
			}else{
				promise = Activity.upsertActivity($scope.activity);
			}
			promise.then(function(data){
				$scope.activity.posterData.id = data.id;
				if($scope.activity.participateRange === 0){
					$scope.$emit('setMjsValue', {key: 'fullshopmjsData', value: null});
					createPoster(data);
				}else{
					$scope.$emit('setMjsValue', {key: 'mjsData', value: null});
					if($scope.globalData.restart === true) {
						var deleteIds = $scope.globalData.deleteIds;
						if(deleteIds && deleteIds.length > 0) {
					    	ActivityProduct.deleteProduct({ids: deleteIds}).then(function(response){});
					    }
					    var reAddedIds = $scope.globalData.reAddedIds;
					    if(reAddedIds && reAddedIds.length > 0) {
					    	ActivityProduct.deleteProduct({ids: reAddedIds}).then(function(response){
					    		doProductAdd(data);
					    	});
					    }
					    $scope.$emit('setMjsValue', {key: 'deleteIds', value: null});
					    $scope.$emit('setMjsValue', {key: 'reAddedIds', value: null});
					}else {
						doProductAdd(data);
					}
				}
			}, function(error){
				$scope.creating = false;
				$scope.errorMessage = error.errorMessage;
				if($scope.errorMessage.indexOf('试用版只能创建1个活动') !== -1) {
					$rootScope.popBuyLink('恭喜您获得一个红包', '试用版只能创建一个活动，请升级到标准版', 'http://tb.cn/6lGQlQx');
				}
			});
		}

		function doProductAdd(data) {
			ActivityProduct.add(formatProductsData(data)).then(function(productsData){
				createPoster(data);
				$scope.$emit('setMjsValue', {key: 'productsInbox', value: null});
			}, function(error){
				$scope.errorMessage = error.errorMessage;
			});
		}

		function formatProductsData(data) {
			var params = {
	    		activityId : data.id,
	    		items: []
	    	};
	    	angular.forEach($scope.globalData.productsInbox, function(item){
	    		var itemId;
	    		if(item.source) {
	    			itemId = item.source.wareId;
	    		}else {
	    			itemId = item.itemId;
	    		}
	    		var temp = {
	    			title: item.title,
	    			picUrl: item.logo,
	    			price: item.price,
	    			itemId: itemId
	    		};
	    		params.items.push(temp);
	    	});
	    	return params;
		}

		function createPoster(data) {
			if(!angular.isUndefined($scope.activity.posterData.templateCode) && $scope.activity.posterData.templateCode !== 'none') {
				$scope.activity.posterData.itemIds = [];
				angular.forEach($scope.globalData.productsInbox, function(item){
					var itemId;
		    		if(item.source) {
		    			itemId = item.source.wareId;
		    		}else {
		    			itemId = item.itemId;
		    		}
					$scope.activity.posterData.itemIds.push(itemId);
	    		});
				ActivityPoster.createPoster($scope.activity.posterData).then(function(response){
					$scope.creating = false;
					$rootScope.$broadcast('clearGiftsInbox');
					if($scope.globalData.restart) {
						$state.go('member.promotion.promotionmisc.success', {activityId: data.id, status: 'restart'});
					}else {
						$state.go('member.promotion.promotionmisc.success', {activityId: data.id, status: $scope.globalData.event});
					}
					$scope.$emit('setMjsValue', {key: 'restart', value: false});
				}, function(error){
					$scope.errorMessage = error.errorMessage;
					$scope.creating = false;
				});
			}else{
				$scope.creating = false;
				if($scope.globalData.restart) {
					$state.go('member.promotion.promotionmisc.success', {activityId: data.id, status: 'restart'});
				}else {
					$state.go('member.promotion.promotionmisc.success', {activityId: data.id, status: $scope.globalData.event});	
				}
				$scope.$emit('setMjsValue', {key: 'restart', value: false});
			}
		}

		function popMinDiscount() {
			return ($scope.activity.promotionType === 1 && $scope.activity.promotionValue < 700 && !$rootScope.popHelpNeverStatus && !$scope.popHelpStatus);
		}
	}

		/**
	* @ngInject
	*/
	function TaobaomjsEditCtrl($scope, $state, stepsFactory, Activity, $stateParams, systemMath, $rootScope, ActivityPoster) {
		$scope.editPage = true;
		$scope.systemTags = ['满减促销','满就包邮', '满就送礼'];
		$scope.steps = stepsFactory.$new({labels: ['修改活动基本详情'], currentStep: 1});

		$scope.popHelpStatus = false;
		Activity.getActivity({id: $stateParams.activityId}).then(function(data){
			$scope.data = data;
			$scope.data.startTime = systemMath.toDateString(new Date($scope.data.startTime * 1000));
			$scope.data.endTime = systemMath.toDateString(new Date($scope.data.endTime * 1000));
			$scope.data.priceTag = $scope.data.detail.priceTag;
			$scope.data.shopId = $scope.data.shop.id;
		});

		$scope.submitEdit = submitEdit;
		$scope.tabActions = {
			formatTab: function(){},
			setPoster: function(code){}
		};

		function submitEdit() {
			$scope.tabActions.formatTab();
			if(popMinDiscount()) {
				$rootScope.minDiscountSet();
				$scope.popHelpStatus = true;
				$rootScope.sureClickCallBack = doEdit;
			}else {
				doEdit();	
			}
		}
		function doEdit() {
			$scope.tabActions.setPoster();
			$scope.editing = true;
			$scope.data.startTime = systemMath.convertToTime($scope.data.startTime);
			$scope.data.endTime = systemMath.convertToTime($scope.data.endTime);
			Activity.upsertActivity($scope.data).then(function(data){
				if($scope.data.oldPoster !== $scope.data.posterData.template) {
					$scope.data.posterData.id = data.id;
					$scope.data.posterData.isAutoInsert = true;
					ActivityPoster.createPoster($scope.data.posterData).then(function(){
						$scope.editing = false;
						$state.go('member.promotion.promotionmisc.list');
					});
				}else{
					$scope.editing = false;
					$state.go('member.promotion.promotionmisc.list');
				}
				$rootScope.$broadcast('clearGiftsInbox');
			}, function(error){console.log(error);
				$scope.editing = false;
				$scope.errorMessage = error.errorMessage;
			});
		}

		function popMinDiscount() {
			return ($scope.data.promotionType === 1 && $scope.data.promotionValue < 700 && !$rootScope.popHelpNeverStatus && !$scope.popHelpStatus);
		}
	}
})(window.angular);