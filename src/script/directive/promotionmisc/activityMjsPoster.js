(function(angular, undefined){'use strict';

	/**
	* 满就送横幅模板管理
	*/
	angular
		.module('directives.activityMjsPoster', [])
		.factory('mjsDetailFactory', mjsDetailFactory)
		.directive('mjsDetailSet', mjsDetailSetDirective)
		.directive('mjsDetailposterSet', mjsDetailposterSetDirective)
		.controller('mjsDetailSetCtrl', mjsDetailSetCtrl)
		.controller('mjsDetailposterSetCtrl', mjsDetailposterSetCtrl)
	;

	/**
	* @ngInject
	*/
	function mjsDetailFactory() {
		return {
			getPureTab: getPureTab
		};
		function getPureTab() {
			return {
				title: '优惠详情', promotion: [{type: 0,value: 10, check: true}, {type: 1, value: 9, check: false}, {check: false, giftName: null}, {check: false, excludeArea: null}], amountMultiple: {check: true, totalPrice: 100}, itemMultiple: {check: false, itemCount: 2},
			}
		}
	}

	function mjsDetailSetDirective() {
		return {
			restrict: 'E',
			templateUrl: '/template/activity/poster/mjsDetailTabs.tpl.html',
			controller: 'mjsDetailSetCtrl',
			scope: {
				activity: '=',
				actions: '='
			}
		};
	}

	/**
	* @ngInject
	*/
	function mjsDetailSetCtrl($scope, mjsDetailFactory, $sce, mjsPosters, ActivityPoster, systemMath) {
		$scope.tabs = [];
		$scope.mjsPosters = mjsPosters;
		this.activity = $scope.activity;
		if($scope.activity.detail){
			angular.forEach($scope.activity.detail, function(value, key){
				$scope.activity[key] = value;
			});
		}
		if(typeof $scope.activity.startTime !== 'string') {
			$scope.activity.startDate = $scope.activity.startTime*1000;
			$scope.activity.endDate = $scope.activity.endTime*1000;
		}else{
			$scope.activity.startDate = $scope.activity.startTime;
			$scope.activity.endDate = $scope.activity.endTime;
		}

		$scope.tabs.push(mjsDetailFactory.getPureTab());
		$scope.currentTab = $scope.tabs[0];
 		$scope.addTab = addTab;

		function addTab() {
			$scope.tabs.push(mjsDetailFactory.getPureTab());
		}

		$scope.actions.formatTab = function(){
			angular.forEach($scope.tabs, function(tab){
				angular.forEach(tab.promotion, function(promotion){
					if(promotion.check){
						if(!angular.isUndefined(promotion.type)){
							$scope.activity.promotionType = promotion.type;
							$scope.activity.promotionValue = parseInt(promotion.value * 100);	
						}
						if(!angular.isUndefined(promotion.excludeArea)) {
							if(angular.isUndefined($scope.activity.excludeArea) && !angular.isUndefined($scope.excludeAreBack)) {
								$scope.activity.excludeArea = $scope.excludeAreBack;
							}
							if(angular.isObject($scope.activity.excludeArea)) {
								var codeStr = $scope.activity.excludeArea.code.join('*');
								var nameStr = $scope.activity.excludeArea.name.join('*');
								$scope.activity.excludeArea = codeStr + '#' + nameStr;
							}
						}
						if(!angular.isUndefined(promotion.giftName)) {
							$scope.activity.giftName = promotion.giftName;
							$scope.activity.giftUrl = promotion.giftUrl;
							$scope.activity.giftId = promotion.giftId;
						}
					}else{
						if(!angular.isUndefined(promotion.excludeArea)) {
							if(!angular.isUndefined($scope.activity.excludeArea)) {
								$scope.excludeAreBack = $scope.activity.excludeArea;
								delete $scope.activity.excludeArea;
							}
						}
						if(!angular.isUndefined(promotion.giftName)) {
							if(!angular.isUndefined($scope.activity.giftId)){ delete $scope.activity.giftId;}
							if(!angular.isUndefined($scope.activity.giftName)){ delete $scope.activity.giftName;}
							if(!angular.isUndefined($scope.activity.giftUrl)){ delete $scope.activity.giftUrl;}
						}
					}
				});
				if(!tab.promotion[0].check && !tab.promotion[1].check) {
					delete $scope.activity.promotionType;
				}
				$scope.activity.totalPrice = (tab.amountMultiple.check) ? tab.amountMultiple.totalPrice * 100 : 0;
				$scope.activity.isItemMultiple = (tab.amountMultiple.check) ? false : (!angular.isUndefined(tab.multipleCheck) ? tab.multipleCheck : false);
				$scope.activity.isAmountMultiple = (tab.amountMultiple.check) ? (!angular.isUndefined(tab.multipleCheck) ? tab.multipleCheck : false) : false;
				$scope.activity.itemCount = (tab.amountMultiple.check) ? 0 : tab.itemMultiple.itemCount;
			});
		}

		$scope.actions.setPoster = function(){
			if($scope.activity.posterData.desc !== undefined){
				$scope.activity.posterData.desc = $sce.trustAsHtml($scope.activity.posterData.desc.replace(/\n/g, '<br />'));
			}
			angular.forEach($scope.tabs, function(tab){
				$scope.tab = tab;
				angular.forEach($scope.mjsPosters, function(mjsPoster, key){
					if(mjsPoster.tplName === $scope.activity.posterData.templateCode){
						ActivityPoster.compileTemp($scope.mjsPosters[key].dir, $scope).then(function(data){
							$scope.activity.posterData.templateCode = $scope.mjsPosters[key].tplName;
							$scope.activity.posterData.template = data;
							$scope.activity.posterData.note = $scope.mjsPosters[key].name;
						});
					}
				});
			});
		}
	}

	/**
	* @ngInject
	*/
	function mjsDetailposterSetDirective() {
		return {
			restrict: 'E',
			require: '^^mjsDetailSet',
			templateUrl: '/template/activity/poster/mjsPosterSet.tpl.html',
			controller: 'mjsDetailposterSetCtrl',
			scope: {
				tab: "=data",
				activity: "="
			}
		};
	}

	/**
	* @ngInject
	*/
	function mjsDetailposterSetCtrl($scope, ActivityPoster, mjsPosters, listFactory, ActivityProduct, $rootScope) {
		$scope.mjsPosters = mjsPosters;
		ActivityPoster.getAreas({shopId: $scope.activity.shopId}).then(function(data){
			$scope.areas = data;
			$scope.areaKeys = Object.keys(data);
			angular.forEach($scope.areaKeys, function(key){
				$scope.areas[key].check = true;
				angular.forEach($scope.areas[key].provinces, function(value){
					value.check = true;
				});
			});
			if($scope.activity.detail){
				angular.forEach($scope.activity.detail, function(value, key){
					$scope.activity[key] = value;
				});
			}
			checkActivityData();
		});
		$scope.productList = listFactory.$new(ActivityProduct, {ns:'giftsInbox'});
		$scope.productList.filterOptions = {
			shopId: $scope.activity.shopId,
			sku: true
		};
		$scope.setting = {add: '选择', added: '取消', limit: 1, status: 'asGift', hideOrder: true};

		$scope.$on('clearGiftsInbox', function(event, data){
			$scope.productList.cacheStorage.removeAll();
		});
		function checkActivityData() {
			if(!angular.isUndefined($scope.activity.totalPrice)){
				if($scope.activity.totalPrice !== 0){
					$scope.tab.amountMultiple.check = true;
					$scope.tab.itemMultiple.check = false;
					$scope.tab.amountMultiple.totalPrice = $scope.activity.totalPrice/100;
					$scope.tab.multipleCheck = $scope.activity.isAmountMultiple;
				}else{
					$scope.tab.itemMultiple.check = true;
					$scope.tab.amountMultiple.check = false;
					$scope.tab.itemMultiple.itemCount = $scope.activity.itemCount;
					$scope.tab.multipleCheck = $scope.activity.isItemMultiple;
				}
				angular.forEach($scope.tab.promotion, function(promotion){
					if($scope.activity.promotionType === promotion.type && (promotion.type === 1 || promotion.type === 0)){
						promotion.check = true;
						promotion.value = $scope.activity.promotionValue/100;
					}else{
						promotion.check = false;
					}
				});
				if(!angular.isUndefined($scope.activity.excludeArea) && $scope.activity.excludeArea !== null) {
					$scope.tab.promotion[3].check = true;
					var excludeArea = {};
					$scope.activity.freeArea = {code: [], name: []};
					excludeArea.code = ($scope.activity.excludeArea.split('#')[0]).split('*');
					excludeArea.name = ($scope.activity.excludeArea.split('#')[1]).split('*');
					$scope.activity.excludeArea = excludeArea;
					angular.forEach($scope.areaKeys, function(key){
						angular.forEach($scope.areas[key].provinces, function(value){
							value.check = true;
							$scope.areas[key].check = true;
							var keepGoing = true;
							angular.forEach($scope.activity.excludeArea.code, function(item, itemKey){
								$scope.activity.excludeArea.code[itemKey] = parseInt(item);
								if(keepGoing) {
									if($scope.activity.excludeArea.code[itemKey] === value.code){
										value.check = false;
										$scope.areas[key].check = false;
										keepGoing = false;
									}
								}
							});
							if(value.check){
								$scope.activity.freeArea.code.push(value.code);
								$scope.activity.freeArea.name.push(value.name);
							}
						});
					});
					if($scope.activity.freeArea.name.length > 15) {
						$scope.activity.postFreeAreasStr = '不包邮地区为：';
						$scope.activity.postFreeAreasStr += $scope.activity.excludeArea.name.join(',');
						$scope.activity.postFreeAreasStr += ',港澳台及海外';
					}else{
						$scope.activity.postFreeAreasStr = '包邮地区为：';
						$scope.activity.postFreeAreasStr += $scope.activity.freeArea.name.join(',');
					}
				}
				if(!angular.isUndefined($scope.activity.giftId) && $scope.activity.giftId !== null) {
					$scope.tab.promotion[2].check = true;
					$scope.tab.promotion[2].giftName = $scope.activity.giftName;
					$scope.tab.promotion[2].giftId = $scope.activity.giftId;
					$scope.tab.promotion[2].giftUrl = $scope.activity.giftUrl;
				}
			}
		}
	
		if(!angular.isUndefined($scope.activity.id)) {
			ActivityPoster.queryPoster({id: $scope.activity.id}).then(function(result){
				$scope.activity.posterData = result.poster;
				$scope.activity.oldPoster = result.poster.template;
				checkPoster();
			});
		}else{
			checkPoster();
		}

		$scope.setPoster 	= setPoster;
		$scope.checkAllArea = checkAllArea;
		$scope.uncheckAllArea = uncheckAllArea;
		$scope.surePostArea = surePostArea;
		$scope.toggleProvinceCheck = toggleProvinceCheck;
		$scope.sureGift 	= sureGift;
		$scope.popDiscountTip = $rootScope.popDiscountTip;

		function checkPoster() {
			if($scope.activity.posterData){
				var regx = /<span style="white-space: pre-wrap; display: block; margin: 15px auto;" -html="activity.posterData.desc" class="">.*<\/span>/;
				var descReg = $scope.activity.posterData.template.match(regx);
				if(descReg[0] !== null){
					$scope.activity.posterData.desc = descReg[0].replace('<span style="white-space: pre-wrap; display: block; margin: 15px auto;" -html="activity.posterData.desc" class="">', '');
					$scope.activity.posterData.desc = $scope.activity.posterData.desc.replace('</span>', '');
				}
				angular.forEach($scope.mjsPosters, function(post, key){
					if(post.tplName === $scope.activity.posterData.templateCode){
						$scope.mjsPosterSet = key;
					}
				});
			}else{
				$scope.mjsPosterSet = 0;
				$scope.activity.posterData = {};
			}
			setPoster($scope.mjsPosterSet);
		}

		function setPoster(code) {
			$scope.mjsPosterSet = code;
			if(code !== 'none'){
				ActivityPoster.compileTemp($scope.mjsPosters[code].dir, $scope).then(function(data){
					$scope.activity.posterData.templateCode = $scope.mjsPosters[code].tplName;
					$scope.activity.posterData.template = data;
					$scope.activity.posterData.note = $scope.mjsPosters[code].name;
				});
			}else{
				$scope.activity.posterData.templateCode = 'none';
			}
		}

		function checkAllArea() {
			angular.forEach($scope.areaKeys, function(key){
				$scope.areas[key].check = true;
				angular.forEach($scope.areas[key].provinces, function(value){
					value.check = true;
				});
			});
		}
		function uncheckAllArea() {
			angular.forEach($scope.areaKeys, function(key){
				$scope.areas[key].check = false;
				angular.forEach($scope.areas[key].provinces, function(value){
					value.check = false;
				});
			});
		}
		function toggleProvinceCheck(checkStatus, key) {
			if(checkStatus) {
				angular.forEach($scope.areas[key].provinces, function(item){
					item.check = true;
				});
			}else{
				angular.forEach($scope.areas[key].provinces, function(item){
					item.check = false;
				});
			}
		}

		function surePostArea() {
			$scope.tab.promotion[3].check = true;
			$scope.activity.excludeArea = {code: [], name: []};
			$scope.activity.freeArea = {code: [], name: []};
			angular.forEach($scope.areaKeys, function(key){
				angular.forEach($scope.areas[key].provinces, function(value){
					if(!value.check) {
						$scope.activity.excludeArea.code.push(value.code);
						$scope.activity.excludeArea.name.push(value.name);
					}else{
						$scope.activity.freeArea.code.push(value.code);
						$scope.activity.freeArea.name.push(value.name);
					}
				});
			});
			if($scope.activity.freeArea.name.length > 15) {
				$scope.activity.postFreeAreasStr = '不包邮地区为：';
				$scope.activity.postFreeAreasStr += $scope.activity.excludeArea.name.join(',');
				$scope.activity.postFreeAreasStr += ',港澳台及海外';
			}else{
				$scope.activity.postFreeAreasStr = '包邮地区为：';
				$scope.activity.postFreeAreasStr += $scope.activity.freeArea.name.join(',');
			}
		}

		
		function sureGift() {
			$scope.tab.promotion[2].check = true;
			var gift = $scope.productList.cacheStorage.itemsToArray()[0];
			$scope.tab.promotion[2].giftName = gift.title.substr(0, 31);
			$scope.tab.promotion[2].giftId = gift.source.wareId;
			$scope.tab.promotion[2].giftUrl = gift.taobaoUrl;
		}
	}
})(window.angular);