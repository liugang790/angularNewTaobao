(function(angular, undefined) {'use strict';

/**
 * @ngdoc product.sync
 * @name product.sync
 * @description 商品同步功能模块
 */
angular
    .module('product.sync', [])
    .config(Configure)
    .constant('productSyncListNs', 'productSync')
    .controller('ProductListSyncCtrl', ProductListSyncCtrl)
    .controller('ProductSyncCtrl', ProductSyncCtrl)
    .controller('productSyncTaskDescCtrl', ProductSyncTaskDescCtrl)
    .controller('targetShopItemCtrl', targetShopItemCtrl)
;


/**
 * @ngdoc config
 * @ngInject
 */
function Configure($routeProvider) {
    $routeProvider
        .when('/product/sync', {
            templateUrl: '/src/script/product/productSync/list.tpl.html',
            controller: 'ProductListSyncCtrl'
        })
        .when('/product/sync/operations', {
            templateUrl: '/src/script/product/productSync/sync.tpl.html',
            controller: 'ProductSyncCtrl'
        })
    ;
}

/**
* @ngdoc controller
* @name ProductSyncCtrl
* @description 商品同步控制器
* @ngInject
*/
function ProductListSyncCtrl($scope, $location, productSyncListNs, productListManager) {

    $scope.productList = productListManager.$get(productSyncListNs);
    $scope.productList.init(initCallback);
    $scope.listActions = [
        {
            label        : '商品同步',
            icons        : 'fa fa-copy',
            class        : 'btn-primary',
            onClick      : doSync,
            checkDisabled: checkSync
        }
    ];

    function checkSync() {
        return $scope.productList.inboxProductCount < 1;
    }

    /**
     * 执行商品同步
     */
    function doSync() {
        $location.path('/product/sync/operations');
    }

    function initCallback(list) {
        if(list.productSources.length > 1) {
            list.filterOptions.source = list.productSources[1];
        }
    }
}

/**
* @ngdoc controller
* @ngInject
* @ngdescription
*
* 商品同步功能管理
*/
function ProductSyncCtrl($scope, Shop, $filter, $location, $route, StorageFactory, productSyncListNs, productListManager, createTask) {
    $scope.targetShops = [];
    $scope.notifyStatus = false;
    $scope.list = productListManager.$get(productSyncListNs);
    $scope.list.init(initCallback);

    Shop.query().then(function(data){
    	$scope.shops = data.items;
    });

    $scope.createSyncTask   = createSyncTask;  //创建商品同步任务
    $scope.returnList       = returnList;      //返回商品列表对商品清单再做修改
    $scope.addShop          = addShop;         //添加店铺到目标店铺中
    $scope.setTargetShops   = setTargetShops;  //更新当前店铺

    $scope.shopFilter = function(shop) {
        return (shop.app.platformCode !== '');
    }

    function addShop() {
    	$scope.notifyStatus = false;
        var has = $filter('filter')($scope.targetShops, {value: $scope.currentShop.id});
        if(has.length <= 0){
	        $scope.targetShops.push($scope.currentShop);
        }
    }

    function setTargetShops(targetShops) {
        $scope.targetShops = targetShops;
    }

    function createSyncTask() {
    	$scope.allProducts = $scope.list.inboxStorage.items;
        var taskData = {
            from: [],
            to: []
        };

        angular.forEach($scope.allProducts, function(product, key){
            var tmp = {
                shopId: product.source.shop.id,
                title: product.title,
                logo: product.logo,
                url: product.url,
                wareId: product.source.wareId,
            };
            taskData.from.push(tmp);
        });

        angular.forEach($scope.targetShops, function(shop, key){
        	var to = {shopId: shop.id};
        	if(shop.category) to.cid = shop.category;
            if(!shop.category && shop.level2Cid) {
                to.cid = shop.level2Cid.cid;
            }
        	if(shop.brand !== '') to.bid = shop.brand;
        	taskData.to.push(to);
        });
        $scope.taskStatus = 'creating';
        $scope.list.inboxStorage.removeAll();

        createTask.createSyncTask(taskData).then(function(tasks){
            $scope.taskStatus = 'done';
            $location.path('/task/company/list');
        }, function(error){
            console.log(error);
        });
    }

    function returnList() {
        $location.path('/product/sync');
    }

    function initCallback(list) {
        if(list.productSources.length > 1) {
            list.filterOptions.source = list.productSources[1];
        }
    }
}

/**
 * @ngdoc controller
 * @ngInject
 * @name productSyncTaskDescCtrl
 * @description 商品同步任务详情控制器
 */
function ProductSyncTaskDescCtrl($scope, Shop, $filter) {
    $scope.syncOriginShop = {};
    $scope.syncTargetShop = {};

    $scope.syncOriginShop = $filter('filter')($scope.shops, {id : $scope.task.desc.originShop})[0];
    $scope.syncTargetShop = $filter('filter')($scope.shops, {id : $scope.task.desc.targetShop})[0];
}

/**
* @ngdoc controller
* @name targetShopItemCtrl
* @ngInject
* @description 目标店铺管理，目标店铺添加、移除和店铺分类操作
*/
function targetShopItemCtrl($scope, Shop, $q){
	$scope.removeShop = function() {
        $scope.targetShops = $scope.targetShops.filter(function(item){
            return item.id !== $scope.shop.id;
        });
        $scope.setTargetShops($scope.targetShops);
    }
}

})(window.angular);
