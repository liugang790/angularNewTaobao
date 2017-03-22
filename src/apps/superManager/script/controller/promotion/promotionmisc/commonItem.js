(function(angular, undefined){'use strict';

	/**
	* 部分商品折扣活动模块
	*/
	angular
		.module('promotionmisc.CommonItem', [])
		.config(Configure)
		.constant('stepLabels', ['设置活动基本信息','选择活动商品','设置优惠力度'])
		.controller('CommonItemMainCtrl', CommonItemMainCtrl)
		.controller('CommonItemCreateCtrl', CommonItemCreateCtrl)
		.controller('CommonItemEditCtrl', CommonItemEditCtrl)
		.controller('CommonItemProductsCtrl', CommonItemProductsCtrl)
		.controller('CommonItemDiscountCtrl', CommonItemDiscountCtrl)
	;

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider
			.state('member.promotion.promotionmisc.commonitem', {
				url: '/commonitem',
				parent: 'member.promotion.promotionmisc',
				views: {
					"": {
						template: '<div ui-view="commonitem"></div>',
						controller: 'CommonItemMainCtrl'
					}
				},
				resolve: {
					currentShop: /* @ngInject */function(Context){
						return Context.shop();
					}
				}
			})
			.state('member.promotion.promotionmisc.commonitem.create', {
				url: '/create',
				parent: 'member.promotion.promotionmisc.commonitem',
				views: {
					'commonitem': {
						templateUrl: '/template/promotion/promotionmisc/commonitem/create.tpl.html',
						controller: 'CommonItemCreateCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.commonitem.edit', {
				url: '/edit/:activityId',
				parent: 'member.promotion.promotionmisc.commonitem',
				views: {
					'commonitem': {
						templateUrl: '/template/promotion/promotionmisc/commonitem/create.tpl.html',
						controller: 'CommonItemEditCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.commonitem.addproducts', {
				url: '/add-products',
				parent: 'member.promotion.promotionmisc.commonitem',
				views: {
					'commonitem': {
						templateUrl: '/template/promotion/promotionmisc/commonitem/products.tpl.html',
						controller: 'CommonItemProductsCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.commonitem.setdiscount', {
				url: '/set-discount/{activityId}',
				params: {
					activityId: {value: 'null'}
				},
				parent: 'member.promotion.promotionmisc.commonitem',
				views: {
					'commonitem': {
						templateUrl: '/template/promotion/promotionmisc/commonitem/setdiscount.tpl.html',
						controller: 'CommonItemDiscountCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.commonitem.restart', {
				url: '/restart/:activityId',
				parent: 'member.promotion.promotionmisc.commonitem',
				views: {
					'commonitem': {
						templateUrl: '/template/promotion/promotionmisc/commonitem/create.tpl.html',
						controller: 'CommonItemCreateCtrl'
					}
				}
			})
		;
	}

	/**
	* @ngInject
	*/
	function CommonItemMainCtrl($scope, $state, currentShop, appInfo) {
		$scope.currentShop = currentShop;
		$scope.globalData = {};
		$scope.$on('setCommonItemValue', function(event, obj){
			$scope.globalData[obj.key] = obj.value;
		});
		$scope.$on('setCommonItemProductByUniqueId', function(event, obj){
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
	function CommonItemCreateCtrl($scope, $state, stepsFactory, stepLabels, systemMath, Activity, $stateParams, appInfo, $rootScope, ActivityProduct) {
		$scope.steps = stepsFactory.$new({labels: stepLabels, currentStep: 1});
		$scope.stepLabels =  stepLabels;
		$scope.systemTags = ['限时促销','限时抢购','新品上市','春装首发'];
		var dt = new Date();
		if(appInfo.has('deadline')) {
			$scope.subscribeVer = appInfo.get('deadline').itemCode;
		}
		$scope.data = {
			typeCode: 'taobaocommonitem',
			title: '通用优惠活动'+dt.getFullYear()+(dt.getMonth()+1)+dt.getDate()+systemMath.getRandomInt(100, 1000),
			startTime: systemMath.toDateString(new Date()),
			endTime: systemMath.toDateString(new Date(dt.setDate(dt.getDate() + 7))),
			priceTag: $scope.systemTags[0],
			shopId : $scope.currentShop.id
		};
		if(!angular.isUndefined($scope.globalData['baseInfo'])) {
			$scope.data = $scope.globalData['baseInfo'];
			$scope.data.startTime = systemMath.toDateString(new Date($scope.data.startTime * 1000));
			$scope.data.endTime = systemMath.toDateString(new Date($scope.data.endTime * 1000));
			if($scope.data.id){
				$scope.data.priceTag = $scope.data.detail.priceTag;
			}
		}
		if($state.current.name === 'member.promotion.promotionmisc.commonitem.restart') {
			$scope.$emit('setCommonItemValue', {key: 'restart', value: true});
			Activity.getActivity({id: $stateParams.activityId}).then(function(data){
				data.title = '[重开]'+data.title;
				data.startTime = systemMath.toDateString(new Date());
				data.endTime = systemMath.toDateString(new Date(dt.setDate(dt.getDate() + 7)));
				$scope.data = data;
				$scope.data.priceTag = data.detail.priceTag;
				$scope.data.shopId = data.shop.id;
			});
		}
		$scope.editPage = false;

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

		$scope.doCreate = function() {
			formatData();
			$scope.$emit('setCommonItemValue', {key: 'baseInfo', value: $scope.data});
			$state.go('^.addproducts');
		}

		$scope.restartNow = function(){	
			$scope.restarting = true;
			formatData();
			ActivityProduct.getAdded({id: $scope.data.id}).then(function(addedProducts){
				Activity.restartActivity($scope.data).then(function(newActivity){
					var params = {'activityId':newActivity.id, 'items': []};
					var ids = [];
					addedProducts.items.forEach(function(item){
						params.items.push({
							itemId: item.itemId,
							picUrl: item.picUrl,
							title: item.title,
							price: item.oldPrice/100,
							promotionType: item.detail.promotionType,
							promotionValue: item.detail.promotionValue
						});
						ids.push(item.id);
					});
					ActivityProduct.deleteProduct({ids: ids}).then(function(response){
						ActivityProduct.add(params).then(function(result){
							$scope.restarting = false;
							$state.go('member.promotion.promotionmisc.success', {activityId: params.activityId, status: 'restart'});
						}, function(error){
							$scope.restarting = false;
							$scope.errorMessage = '添加活动商品失败：' + error.errorMessage;
						});
					}, function(error){
						$scope.restarting = false;
						$scope.errorMessage = '重启活动失败：' + error.errorMessage;
					});
				});
			}, function(error){
				$scope.restarting = false;
				$scope.errorMessage = '获取活动已添加商品失败：' + error.errorMessage;
			});
		}
	}

	/**
	* @ngInject
	*/
	function CommonItemProductsCtrl($scope, $state, stepsFactory, listFactory, ActivityProduct, stepLabels, $timeout, $rootScope) {
		$scope.steps = stepsFactory.$new({labels: stepLabels, currentStep: 2});
		$scope.alllimitCounts = 150;

	    if($scope.globals.justAddProduct) {
	    	$scope.activity = $scope.globals.activityToAddProduct;
	    }else {
	    	$scope.activity = $scope.globalData.baseInfo;
	    }

	    $scope.productsInbox = (!angular.isUndefined($scope.globalData.productsInbox)) ? $scope.globalData.productsInbox : [];
		$scope.limitCounts = $scope.alllimitCounts - (!angular.isUndefined($scope.activity.addedTotal)? $scope.activity.addedTotal : 0);

		$scope.productList = listFactory.$new(ActivityProduct, {ns:'activityProductsInbox'});
		$scope.productList.filterOptions = {
			shopId: $scope.currentShop.id
		};
		$scope.setting = {};$scope.addedProducts = [];

		$timeout(function(){
			$rootScope.$broadcast('setProductListActivity', $scope.activity);
		}, 1000);
		if($scope.productsInbox.length > 0) {
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
								addedProducts.items[i].source = {typeCode : 'taobao', wareId: addedProducts.items[i].itemId};
								addedProducts.items[i].newPrice = addedProducts.items[i].price/100;
								addedProducts.items[i].price = addedProducts.items[i].oldPrice/100;
								addedProducts.items[i].focusDiscount = false;
								addedProducts.items[i].logo = addedProducts.items[i].picUrl;
								addedProducts.items[i].uniqueId = 'taobao'+addedProducts.items[i].itemId;
								$scope.productList.cacheStorage.put(addedProducts.items[i].uniqueId, addedProducts.items[i]);
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
	    		icons: 'sui-icon icon-arrow-left',
	    		class: '',
	    		onClick: backEdit
	    	},
	    	{
	    		label: '下一步：设置商品折扣',
	    		icons: 'sui-icon icon-arrow-right',
	    		class: 'btn-primary',
	    		onClick: setDiscount,
	    		checkDisabled: check
	    	}
	    ];

	    function backEdit() {
	    	$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productList.cacheStorage.itemsToArray()});
	    	$scope.productList.cacheStorage.removeAll();
	    	$state.go('^.create');
	    }

	    function setDiscount() {
	    	if($scope.globalData.restart === true) {
	    		var deletedProducts = [];
	    		var reAddedProducts = {};
	    		var reAddedIds = [];
	    		angular.forEach($scope.productList.cacheStorage.itemsToArray(), function(item, key){
	    			angular.forEach($scope.addedProducts, function(added){
		    			if(added.itemId === item.source.wareId) {
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
		    	$scope.$emit('setCommonItemValue', {key: 'deleteIds', value: deleteIds});
		    	$scope.$emit('setCommonItemValue', {key: 'reAddedIds', value: reAddedIds});
	    	}
	    	$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productList.cacheStorage.itemsToArray()});
	    	$scope.productList.cacheStorage.removeAll();
	    	if($scope.globalData.justAddProduct) {
	    		$state.go('^.setdiscount', {activityId: $scope.globalData.activityToAddProduct.id});
	    	}else {
	    		$state.go('^.setdiscount');
	    	}
	    }
	    function check() {
	    	if($scope.productList.cacheStorage.keyCount > $scope.limitCounts) {
	    		if($scope.limitCounts < $scope.alllimitCounts) {
	    			$scope.errorMessage = '活动已添加'+($scope.alllimitCounts-$scope.limitCounts)+'个商品，活动商品总数不能超过150个！';
	    		}else {
	    			$scope.errorMessage = '活动商品数量不能超过150个！';
	    		}
	    		$scope.errorStatus = true;
	    	}else{
	    		$scope.errorStatus = false;
	    	}
	    	return ($scope.productList.cacheStorage.keyCount < 1 || $scope.productList.cacheStorage.keyCount > $scope.limitCounts || $scope.addedProducts.length < 0);
	    }
	}

	/**
	* @ngInject
	*/
	function CommonItemDiscountCtrl($scope, $state, $q, $stateParams, stepLabels, stepsFactory, ActivityProduct, listFactory, Activity, $rootScope, systemMath, StorageFactory) {
		$scope.steps = stepsFactory.$new({labels: stepLabels, currentStep: 3});
		if($scope.globals.justAddProduct) {
	    	$scope.activity = $scope.globals.activityToAddProduct;
	    }else {
	    	$scope.activity = $scope.globalData.baseInfo;
	    }

		var params = {
			activityId: '',
			items: []
		};

		if($stateParams.activityId !== 'null') {
			if(angular.isUndefined($scope.activity)) {
				Activity.getActivity({id: $stateParams.activityId}).then(function(res){
					$scope.activity = res;
				});
			}
			$scope.pageTitle = '修改商品';
			$scope.pageStatus = 'updateProduct';
			params.activityId = $stateParams.activityId;
			var factory = {
				query : queryAdded
			};
			$scope.list = listFactory.$new(factory, ['activityProducts']);
			$scope.list.filterOptions.id = $stateParams.activityId;
		}else{
			$scope.pageStatus = false;
			if(!angular.isUndefined($scope.activity.id)){
				params.activityId = $scope.activity.id;
			}
			var ActivityProductsService = {
				query: queryFromGlobal
			};
			$scope.list = listFactory.$new(ActivityProductsService, ['activityProducts']);
		}
		$scope.allDiscountIndex = 10;
		$scope.allCutIndex = 0;
		$scope.popDiscountTipStatus = false;
		$scope.popHelpStatus = false;
		$scope.popHelpNeverStatus = false;
		$scope.showDiscountBtn = false;
		$scope.showCutBtn = false;

		$scope.cutPenny 		= cutPenny;
		$scope.cutPennyDime 	= cutPennyDime;
		$scope.discountAll 		= discountAll;
		$scope.cutAll 			= cutAll;
		$scope.removeListItem 	= removeListItem;
		$scope.stepTwo			= stepTwo;
		$scope.createActivity 	= createActivity;
		$scope.updateProduct 	= updateProduct;
		$scope.addProduct 		= addProduct;
		$scope.sureClick 		= sureClick;

		function addProduct() {
			$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: []});
			Activity.getActivity({id: $stateParams.activityId}).then(function(data){
				$scope.$emit('setCommonItemValue', {key: 'baseInfo', value: data})
				$state.go('member.promotion.promotionmisc.commonitem.addproducts');
			});
		}

		/**
		* 对所有商品的新价格抹去分操作
		*/
		function cutPenny() {
			angular.forEach($scope.list.items, function(product, key){
				product.newPrice = systemMath.removePenny(product.newPrice);
			});
			$scope.productsInbox = $scope.globalData.productsInbox;
			angular.forEach($scope.productsInbox, function(value, key){
				value.focusDiscount = false;
				value.newPrice = systemMath.removePenny(value.newPrice);
				value.cutIndex = value.price - value.newPrice;
			});
			$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productsInbox});
		}
		/**
		* 对所有商品的新价格抹去分和角操作
		*/
		function cutPennyDime() {
			angular.forEach($scope.list.items, function(product, key){
				product.newPrice = systemMath.removeDime(product.newPrice);
			})
			$scope.productsInbox = $scope.globalData.productsInbox;
			angular.forEach($scope.productsInbox, function(value, key){
				value.focusDiscount = false;
				value.newPrice = systemMath.removeDime(value.newPrice);
				value.cutIndex = value.price - value.newPrice;
			});
			$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productsInbox});
		}
		/**
		* 对所有商品打折
		*/
		function discountAll(index) {
			if(index <= 10) {
				angular.forEach($scope.list.items, function(product, key){
					product.focusDiscount = true;
					product.newPrice = systemMath.discount(index, product.price);
				});
				$scope.productsInbox = $scope.globalData.productsInbox;
				angular.forEach($scope.productsInbox, function(value, key){
					value.focusDiscount = true;
					value.discountIndex = index;
					value.newPrice = systemMath.discount(index, value.price);
				});
				$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productsInbox});
				$scope.showDiscountBtn = false;
			}
		}
		/**
		* 对所有商品减价
		*/
		function cutAll(index) {
			if(index >= 0){
				angular.forEach($scope.list.items, function(product, key){
					product.focusDiscount = false;
					product.newPrice = systemMath.cutDown(index, product.price);
				});
				$scope.productsInbox = $scope.globalData.productsInbox;
				angular.forEach($scope.productsInbox, function(value, key){
					value.focusDiscount = false;
					value.cutIndex = index;
					value.newPrice = systemMath.cutDown(index, value.price);
				});
				$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productsInbox});
				$scope.showCutBtn = false;
			}
		}

		function removeListItem(product) {
			//更新当前列表项
			$scope.list.items = $scope.list.items.filter(function(item, key){
				return item.uniqueId !== product.uniqueId;
			});
			//更新已添加商品存储
			$scope.productsInbox = $scope.globalData.productsInbox;
			$scope.productsInbox = $scope.productsInbox.filter(function(value){
				return value.uniqueId !== product.uniqueId;
			})
			$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: $scope.productsInbox});
		}
		function stepTwo() {
			$state.go('^.addproducts');
		}

		function createActivity() {
			checkIndex();
			if(!$scope.checkError){
				if($scope.popDiscountTipStatus){
					$rootScope.minDiscountSet();
					$scope.popHelpStatus = true;
					$rootScope.sureClickCallBack = doCreate;
				}else {
					doCreate();
				}
			}
		}

		function updateProduct() {
			checkIndex();
			if(!$scope.checkError) {
				if($scope.popDiscountTipStatus){
					$rootScope.minDiscountSet();
					$scope.popHelpStatus = true;
					$rootScope.sureClickCallBack = doUpdateProduct;
				}else {
					doUpdateProduct();
				}

			}
		}

		function doCreate() {
			$scope.creating = true;console.log($scope.activity);
			if($scope.activity.priceTag) {
				var promise;
				if($scope.globalData.restart === true) {
					promise = Activity.restartActivity($scope.activity);
				}else{
					promise = Activity.upsertActivity($scope.activity);
				}
				promise.then(function(data){
					$scope.activity = data;
					params.activityId = $scope.activity.id;
					doAddProduct();
				}, function(error) {
					$scope.creating = false;
					$scope.errorMessage = error.errorMessage;
					if($scope.errorMessage.indexOf('试用版只能创建1个活动') !== -1) {
						$rootScope.popBuyLink('恭喜您获得一个红包', '试用版只能创建一个活动，请升级到标准版', 'http://tb.cn/6lGQlQx');
					}
				});
			}else{
				doAddProduct();
			}
		}

		function doAddProduct() {
			if($scope.globalData.restart === true) {
				deleteIds(function(){
					doProductAdd();
				});
			}else{
				doProductAdd();
			}
		}

		function doProductAdd() {
			ActivityProduct.add(params).then(function(data){
				$scope.creating = false;
				$scope.$emit('setCommonItemValue', {key: 'baseInfo', value: {}});
				$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: []});
				if($scope.globals.justAddProduct) {
					$scope.$emit('setGlobalValues', {key: 'activityToAddProduct', value: null});
					$scope.$emit('setGlobalValues', {key: 'justAddProduct', value: false});
				}
				$scope.productsInboxStorage = StorageFactory.$new('activityProductsInbox');
				$scope.productsInboxStorage.removeAll();
				if($scope.globalData.restart === true) {
					$state.go('member.promotion.promotionmisc.success', {activityId: params.activityId, status: 'restart'});	
				}else {
					$state.go('member.promotion.promotionmisc.success', {activityId: params.activityId, status: 'create'});
				}
				$scope.$emit('setCommonItemValue', {key: 'restart', value: false});
			}, function(error){
				$scope.creating = false;
				$scope.errorMessage = error.errorMessage;
			});
		}

		function deleteIds(callback) {
			var ids = [];
			var deleteIds = $scope.globalData.deleteIds;
			if(deleteIds && deleteIds.length > 0) {
				ids = deleteIds;
			    $scope.$emit('setCommonItemValue', {key: 'deleteIds', value: null});
			}
			var reAddedIds = $scope.globalData.reAddedIds;
			if(reAddedIds && reAddedIds.length > 0) {
			  	angular.forEach(reAddedIds, function(id){
			  		ids.push(id);
			  	});
			   	$scope.$emit('setCommonItemValue', {key: 'reAddedIds', value: null});
			}
			ActivityProduct.deleteProduct({ids: ids}).then(function(response){
				callback();
			});
		}

		function doUpdateProduct() {
			$scope.updating = true;
			if($scope.pageStatus === 'updateProduct' && params.items.length === 0) {
				$scope.updating = false;
				$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: []});
				$state.go('^.^.manage', {activityId: params.activityId, tab: 'products'});
				return ;
			}
			ActivityProduct.update(params).then(function(result){
				$scope.updating = false;
				$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: []});
				$state.go('^.^.manage', {activityId: params.activityId, tab: 'products'});
			}, function(error){
				$scope.updating = false;
				if(error.errorMessage === 'items Value is required and can\'t be empty') {
					$scope.productsStorage.removeAll();
					$state.go('^.^.list');
				}else{
					$scope.errorMessage = error.errorMessage;
				}
			});
		}

		function sureClick(popHelpNeverStatus) {
            $scope.closePop(popHelpNeverStatus);
            $scope.sureClickCallBack();
        }

		function checkIndex() {
			$scope.checkError = false;
			$scope.popDiscountTipStatus = false;
			params.items = [];
			//检查当页的折扣、减价
			angular.forEach($scope.list.items, function(listItem){
				if(listItem.focusDiscount){ //折扣聚焦
					if(listItem.discountIndex <= 0 || listItem.discountIndex >= 10){
						listItem.errorMessage = '请设置正确的折扣数!';
						$scope.checkError = true;
					}else{
						listItem.errorMessage = false;
					}
				}else{ //减价聚焦
					if(listItem.cutIndex <= 0 || listItem.cutIndex >= listItem.price){
						listItem.errorMessage = '请设置正确的减价数！';
						$scope.checkError = true;
					}else{
						listItem.errorMessage = false;
					}
				}
			});
			if($scope.checkError){
				return ;
			}
			//检查提交productsInbox 中的数据是否合格
			$scope.productsInbox = $scope.globalData.productsInbox;
			angular.forEach($scope.productsInbox, function(item, key){
				var temp = {};
				if($scope.pageStatus === 'updateProduct'){
					if(parseInt(item.newPrice*100) !== item.taobaoPrice) {
						temp.itemId = item.itemId;
						temp.detailId = item.detail.taobaoCommonItemDetailId;
					}
				}else{
					temp.itemId = item.source.wareId;
					temp.title = item.title;
					temp.picUrl = item.logo;
					temp.price = item.price;
				}
				item.errorMessage = false;
				$scope.$emit('setCommonItemProductByUniqueId', {uniqueId: item.uniqueId, value: item});
				key++;
				if(angular.isUndefined(item.discountIndex) && angular.isUndefined(item.cutIndex) ){
					$scope.errorMessage = item.errorMessage = "第" + key + "商品设置有误,请修改！";
					$scope.checkError = true;
				}else{
					if(item.focusDiscount){ //折扣聚焦
						if(item.discountIndex <=0 || item.discountIndex >= 10){
							$scope.errorMessage = item.errorMessage = "第" + key + "商品,请设置正确折扣数！";
							$scope.checkError = true;
						}
					}else{
						if(item.cutIndex <=0 || item.cutIndex >= item.price){
							$scope.errorMessage = item.errorMessage = "第" + key + "商品,请设置正确减价数！";
							$scope.checkError = true;
						}
					}
				}

				//提示低于7折的商品
				if(item.discountIndex < 7 && !$rootScope.popHelpNeverStatus && !$scope.popHelpStatus) {
					$scope.popDiscountTipStatus = true;
				}

				if(item.focusDiscount){
					temp.promotionType = 1;
					temp.promotionValue = parseInt(item.discountIndex * 100);
				}else{
					temp.promotionType = 0;
					temp.promotionValue = parseFloat(item.cutIndex * 100);
				}
				if(temp.itemId){
					params.items.push(temp);
				}
			});
		}

		function queryFromGlobal(params) {
			var products = {items:[], total: 0};
			var skip = (params.page - 1) * params.pageSize;
			var limit = params.pageSize;
			var productsInbox = $scope.globalData.productsInbox;
			var defer = $q.defer();

			if(angular.isUndefined(productsInbox)) {
				defer.reject({errorMessage: '请返回上一步重新选择商品'});
			}else {
				angular.forEach(productsInbox, function(value, key){
					if(typeof params.searchText !== 'undefined'){
						if(value.title.indexOf(params.searchText) !== -1){
							products['items'].push(value);
							products['total']++;
						}
					}else{
						products['items'].push(value);
						products['total']++;
					}
				});
				products.items = products.items.slice(skip, skip+limit);
				defer.resolve(products);
			}
			return defer.promise;
		}

		function queryAdded(params){
			var deferred = $q.defer();
			ActivityProduct.getAdded(params).then(function(response){
				var result = {items: [], total: response.total};
				angular.forEach(response.items, function(item){
					item.logo = item.picUrl;
					item.taobaoPrice = item.price;
					item.newPrice = parseFloat(item.price/100);
					item.price = parseFloat(item.oldPrice/100);
					item.uniqueId = item.activity.id + ':' + item.itemId;
					result.items.push(item);
				});
				$scope.$emit('setCommonItemValue', {key: 'productsInbox', value: result.items});
				deferred.resolve(result);
			});
			return deferred.promise;
		}
	}

	/**
	* @ngInject
	*/
	function CommonItemEditCtrl(stepsFactory, $stateParams, Activity, systemMath, $state, $scope) {
		$scope.steps = stepsFactory.$new({labels: ['修改活动基本信息'], currentStep: 1});
		Activity.getActivity({id: $stateParams.activityId}).then(function(data){
			$scope.data = data;
			$scope.data.priceTag = $scope.data.detail.priceTag;
			$scope.data.startTime = systemMath.toDateString(new Date($scope.data.startTime * 1000));
			$scope.data.endTime = systemMath.toDateString(new Date($scope.data.endTime * 1000));
			$scope.data.priceTag = $scope.data.detail.priceTag;
		});

		$scope.systemTags = ['限时促销','限时抢购','新品上市','春装首发'];
		$scope.editPage = true;

		$scope.submitEdit = submitEdit;

		function submitEdit() {
			$scope.editing = true;
			$scope.data.startTime = systemMath.convertToTime($scope.data.startTime);
			$scope.data.endTime = systemMath.convertToTime($scope.data.endTime);
			Activity.upsertActivity($scope.data).then(function(data){
				$scope.editing = false;
				$state.go('member.promotion.promotionmisc.list');
			}, function(error){
				$scope.editing = false;
				$scope.errorMessage = error.errorMessage;
			});
		}
	}
})(window.angular);