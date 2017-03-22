(function(angular, sessionStorage, undefined){'use strict';

	angular
		.module('product.list', ['product.resource', 'product.filter', 'product.sku'])
		.directive('productList', ProductListDirective)
		.directive('productListActions', ProductListActionsDirective)
		.directive('productListInboxList', ProductListInboxListDirective)
		/**
		 * 提供商品列表管理功能
		 * @method $get(String ns, Object options) ProductList	返回指定命名空间的商品列表服务
		 */
		.service('productListManager', ProductListManager)
		.controller('productListItemCtrl', listItemCtrl)
	;

	/**
	 * @ngdoc service
	 * @ngInject
	 * @name productListManager
	 * @description 提供商品列表管理功能
	 */
	function ProductListManager($window, $q, $filter, StorageFactory, listFactory, product, productDatabaseManager) {
		var service = {
			$get: getList,
			lists: {}
		};
		return service;

		/**
		 * 返回指定命名空间的商品列表
		 * @param  {String} ns 商品列表命名空间
		 * @return {ProductList}    商品列表对象
		 */
		function getList(ns, options) {
			if(angular.isUndefined(service.lists[ns])) {
				service.lists[ns] = createList(ns, options);
			}
			return service.lists[ns];
		}

		/**
		 * 商品列表对象
		 * @param {string} ns
		 * @param {Object} options
		 */
		function createList(ns, options) {

			if(!angular.isObject(options)) {
				options = {};
			}
			options.ns          = ns;
			options.cache       = true;
			options.cacheFields = ['filterOptions', 'productSources'];
			var list   = listFactory.$new(product.query, options);

			list.ns                  = ns;
			list.productSources      = []
			list.productOnsaleStatus = [];
			list.isSelectedAll       = false;
			list.inboxProductShops   = [];
			list.toggleInboxProduct  = toggleInboxProduct;
			list.addInboxProduct     = addInboxProduct;
			list.removeInboxProduct  = removeInboxProduct;
			list.resetInboxProducts  = resetInboxProducts;
			list.hasInboxProduct     = hasInboxProduct;
			list.baseLoad            = list.load;
			list.load                = load;
			list.init                = init;
			list.loadedCallback      = {};

			list.inboxStorage     = StorageFactory.$new(ns + 'Inbox', {readCacheCallback: readInboxCacheCallback});
			list.inboxShopStorage = StorageFactory.$new(ns + 'InboxShop');
			list.inboxStorageList = listFactory.$new(queryInboxProducts);
			list.inboxShopStorageItems = {"a":{name:'test'}}

			return list;

			function load() {
				return list.baseLoad().then(function(data) {
					var isSelectedAll = true;
					angular.forEach(data.items, function(product) {
						product.isInbox = list.hasInboxProduct(product);
						if(!product.isInbox) {
							isSelectedAll = false;
						}
					})
					list.isSelectedAll = isSelectedAll;
					if(angular.isFunction(list.loadedCallback)) {
						list.loadedCallback(list);
					}
					return data;
				});
			}

			function toggleInboxProduct(product) {
				if(!list.hasInboxProduct(product)) {
					list.addInboxProduct(product);
				} else {
					list.removeInboxProduct(product);
				}
			}

			function addInboxProduct(product) {
				list.inboxStorage.put(product.uniqueId, product);
				var sourceShop = product.source.shop;
				if(!angular.isUndefined(sourceShop)) {
					if(list.inboxShopStorage.has(sourceShop.id)) {
						sourceShop = list.inboxShopStorage.get(sourceShop.id);
					} else {
						sourceShop.products = {};
					}
					sourceShop.products[product.uniqueId] = true;
					list.inboxShopStorage.put(sourceShop.id, sourceShop);
				}
				product.isInbox = true;
			}

			function removeInboxProduct(product) {
				list.inboxStorage.remove(product.uniqueId);
				if(! angular.isUndefined(product.source.shop)){
					var sourceShop = list.inboxShopStorage.get(product.source.shop.id);
					if(angular.isUndefined(sourceShop)) {
						return true;
					}
					delete sourceShop.products[product.uniqueId];
					if(Object.keys(sourceShop.products) < 1) {
						list.inboxShopStorage.remove(sourceShop.id);
					} else {
						//list.inboxShopStorage.put(sourceShop);
					}
				}
				var item = $filter('filter')(list.items, {uniqueId:product.uniqueId});
				if(item.length > 0) {
					item[0].isInbox = false;
				}
			}

			function resetInboxProducts() {
				list.inboxStorage.removeAll();
				angular.forEach(this.items, function(item) {
					item.isInbox = false;
				});
			}

			function hasInboxProduct(product) {
				return list.inboxStorage.has(product.uniqueId);
			}

			function init(callback) {
				return $q.all(list.initPromises).then(function(data) {
					if(list.cacheStorage.hasLocalData()) {
						list.productSources = list.cacheStorage.get('productSources');
						if(!angular.isUndefined(list.filterOptions.source)) {
							var currentSource = $filter('filter')(list.productSources, list.filterOptions.source);
							if(currentSource.length > 0) {
								list.filterOptions.source = currentSource[0];
							}
						}
					} else {
						var loadProductSourcesPromise = productDatabaseManager.query();
						list.initPromises.push(loadProductSourcesPromise);
						return loadProductSourcesPromise.then(function(sources) {
							list.productSources = sources;
							if(angular.isFunction(callback)) {
								callback(list);
							}
							list.filterOptions.source = list.productSources[0];
						});
					}

					return data;
				})
			}

			function hasAttr(obj, key) {
				return !angular.isUndefined(obj[key]);
			}

			function readInboxCacheCallback(items) {
				angular.forEach(items, function(item, key) {
					items[key] = product.$new(item);
				});
			}

			function queryInboxProducts(params) {
	            if(!angular.isObject(params)) {
	                params = {};
	            }

				if(!params['sourceShopId']) {
					return list.inboxStorage.query(params);
				} else {
					var defer = $q.defer();
					var sourceShop = list.inboxShopStorage.get(params.sourceShopId);
					if(angular.isUndefined(sourceShop)){
						defer.resolve({items: [], total: 0});
						return defer.promise;
					}
					var productIds = Object.keys(sourceShop.products);
					var total = productIds.length;

		            if(!hasAttr('page', params)) {
		                params.page = 1;
		            }
		            if(!hasAttr('pageSize', params)) {
		                params.pageSize = 10;
		            }

		            var begin = (params.page - 1) * params.pageSize;
		            if(begin > total) {
		                return result({
		                    total: total,
		                    items: []
		                });
		            }
		            var end = begin + params.pageSize;
		            if(end > total) {
		                end = total;
		            }
		            var keys = productIds.slice(begin, end);
		            var items = [];
		            angular.forEach(keys, function(key) {
		                items.push(list.inboxStorage.get(key));
		            });
		            if(items.length === params.pageSize) {
		            	list.isSelectedAll = true;
		            }else {
		            	list.isSelectedAll = false;
		            }
					defer.resolve({
						items: items,
						total: total
					});
					return defer.promise;
				}
			}
		}
	}

	/**
	* ngdoc directive
	* @name productList
	* @description 商品列表指令
	*/
	function ProductListDirective() {
		return {
			restrict	: 'E',
			templateUrl : '/src/script/product/productList/list.directive.tpl.html',
			controller	: ProductListDirectiveCtrl,
			transclude	: true,
			scope		: {
				list    : ' =',	// 列表服务
				actions : ' ='	// 列表操作项
			}
		};
	}

	/**
	 * 商品列表操作按钮选项指令
	 */
	function ProductListActionsDirective() {
		return {
			restrict: 'E',
			templateUrl: '/src/script/product/productList/list.actions.tpl.html',
			scope: {
				actions: '='
			}
		}
	}

	/**
	 * 商品列表已选商品列表指令
	 */
	function ProductListInboxListDirective() {
		return {
			restrict: 'E',
			templateUrl: '/src/script/product/productList/inbox.list.tpl.html',
			scope: {
				list: "="
			}
		}
	}

	/**
	* ngdoc controller
	* @name ProductListDirectiveCtrl
	* @description 商品列表指令控制器
	* @ngInject
	*/
	function ProductListDirectiveCtrl($scope, $q, $timeout, $uibModal) {
		var filterInitDefer = $q.defer();

		$scope.listFilterData    = $scope.list.filterOptions;
		$scope.filterInitPromise = filterInitDefer.promise;
		$scope.showInboxProducts = showInboxProducts;
		$scope.selecteAll        = selecteAll;

		$timeout(function() {
			filterInitDefer.resolve();
		}, 500);

		function showInboxProducts() {
			$scope.showInboxProductsModal = $uibModal.open({
				templateUrl: '/src/script/product/productList/productModal.tpl.html',
				scope: $scope
			});
		}

		function selecteAll(check) {
			if(check) {
				angular.forEach($scope.list.items, function(product) {
					if(!$scope.list.hasInboxProduct(product)) {
						$scope.list.addInboxProduct(product);
					}
				})
			} else {
				angular.forEach($scope.list.items, function(product) {
					$scope.list.removeInboxProduct(product);
				})
			}
		}
	}

	/*
	* @ngInject
	*/
	function listItemCtrl($scope, $filter, Sku, $location, StorageFactory){
		$scope.selected = false;
		var DescProduct = StorageFactory.$new('DescProduct');
		$scope.getSkus = function (product) {
			$scope.selected = !$scope.selected;
           	$scope.skuLoading = true;
           	var stockTotal = 0;
           	var data = {};

           	if($scope.listFilterData.source.value === 'multiShopProudct'){
           		data.wareId = product.platformItems[0].wareId;
           	}
           	if(product.source.typeCode !== 'spider'){
           		data.shopId = product.source.shop.id;
           		data.wareId = product.source.wareId;
           	}else{
           		data.shopId = product.platformItems[0].shop.id;
           		data.wareId = product.platformItems[0].wareId;
           	}
           	if($scope.selected){
           		Sku.getSkus(data).then(function(skus){
	           		$scope.skus = skus;
           			angular.forEach($scope.skus, function(sku, key){
           				sku.shops = [];
           				angular.forEach(product.platformItems, function(shopItem, key){
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
	           			product.stockTotal = stockTotal;
	           		}
	           		if(product.stockTotal === undefined){
	           			product.stockTotal = '未设置';
	           		}
	           		$scope.skuLoading = false;
           		});
           	}
        };

        $scope.isSelected = function () {
            return $scope.selected;
        };

        $scope.goto = function(url) {
        	DescProduct.put('product', $scope.product);
        	$location.path(url);
        }
	}
})(window.angular, window.sessionStorage);
