(function(angular, undefined) {'use strict';

/**
 * @ngdoc product.ad
 * @name product.ad
 * @description 流量无忧功能模块
 */
angular
    .module('product.ad', [])
    .config(Configure)
    .constant('adListNs', 'ad')
    .provider('ad', AdProvider)
    .controller('ProductListAdCtrl', ProductListAdCtrl)
    .controller('UrlListCtrl', UrlListCtrl)
    .controller('AddedListCtrl', AddedListCtrl)
;

var adProvider;
/**
 * @ngdoc config
 * @ngInject
 */
function Configure($routeProvider) {
    $routeProvider
        .when('/ad/productList', {
            templateUrl: '/src/script/product/ad/list.tpl.html',
            controller: 'ProductListAdCtrl'
        })
    ;    
    $routeProvider
        .when('/ad/items', {
            templateUrl: '/src/script/product/ad/itemslist.tpl.html',
            controller: 'AddedListCtrl'
        })
    ;    
    $routeProvider
        .when('/ad/urls', {
            templateUrl: '/src/script/product/ad/urllist.tpl.html',
            controller: 'UrlListCtrl'
        })
    ;
}

/**
 * @ngdoc provider
 * @ngInject
 */
function AdProvider() {
    adProvider = this;
    this.$get = Ad;

    this.unionInfoApiName = 'ad.union.info';
    this.unionSetApiName  = 'ad.union.setting';
    this.urlListApiName   = 'ad.union.urlList';
    this.removeItemsApiName   = 'ad.union.remove';
}

/**
 * @ngdoc provider
 * @ngInject
 */
function Ad(apiClient) {
    return {
        unionInfo: unionInfo,
        unionSet: unionSet,
        urlList: urlList,
        removeItems: removeItems
    };

    function unionInfo(params) {
        return apiClient.$new(adProvider.unionInfoApiName).send(params).then(function(response){
            return response;
        });
    }

    function unionSet(params) {
        return apiClient.$new(adProvider.unionSetApiName).send(params).then(function(response){
            return response;
        });
    }    

    function removeItems(params) {
        return apiClient.$new(adProvider.removeItemsApiName).send(params).then(function(response){
            return response;
        });
    }

    function urlList(params) {
        return apiClient.$new(adProvider.urlListApiName).send(params).then(function(response){
            return {
                items: response.desc.content.urlList,
                total: response.desc.content.totalNum
            };
        });
    }    
}

/**
* @ngdoc controller
* @description 流量无忧控制器
* @ngInject
*/
function ProductListAdCtrl($scope, $location, $filter, $q, $route, adListNs, productListManager, ad, Shop) {
    $scope.productList          = productListManager.$get(adListNs);
    $scope.productList.pageSize = 20;
    $scope.listFilterData       = $scope.productList.filterOptions;
    $scope.productList.init(initCallback);
    $scope.productList.loadedCallback = loadedCallback;
    $scope.isLoading            = false;
    $scope.selecteAll           = selecteAll;
    $scope.shopFilter           = shopFilter;
    $scope.added = [];
    $scope.actions = [
        {
            label        : '推广',
            icons        : 'fa fa-copy',
            class        : 'btn-primary',
            onClick      : promote,
        }
    ];

    function selecteAll(check) {
        if(check) {
            angular.forEach($scope.productList.items, function(product) {
                if(!$scope.productList.hasInboxProduct(product)) {
                    $scope.productList.addInboxProduct(product);
                }
            })
        } else {
            angular.forEach($scope.productList.items, function(product) {
                $scope.productList.removeInboxProduct(product);
            })
        }
    }
    function initCallback(list) {
        list.productSources = $filter('filter')(list.productSources, shopFilter);
    }
    function shopFilter(shop) {
        return shop.platformCode == 'taobao';
    }
    function promote() {
        angular.forEach($scope.productList.inboxStorage.items, function(item) {
            var tempItem = {
                numiid: parseInt(item.source.wareId),
                picurl: item.logo,
                price: item.price/100,
                title: item.title,
                url: 'https://item.taobao.com/item.htm?id=' + item.source.wareId
            };
            ad.unionSet({shopId:item.source.shop.id,item: tempItem});
        });
        $scope.productList.resetInboxProducts();
        $route.reload();
    }
    function loadedCallback(list) {
        ad.unionInfo({shopId: list.filterOptions.source.value}).then(function(data) {
            angular.forEach(data.items, function(item) {
                if($scope.added.indexOf(String(item.numiid)) < 0) {
                    $scope.added.push(String(item.numiid));
                }
            });
            angular.forEach(list.items, function(item) {
                if($scope.added.indexOf(item.source.wareId) > -1) {
                    item.isAdded = true;
                }
            });
        });
    }

}

/**
* @ngdoc controller
* @description 推广商品列表控制器
* @ngInject
*/
function AddedListCtrl($scope, $location, $filter, $q, $route, listFactory, ad, Shop) {
    var defer = $q.defer();
    $scope.productList          = listFactory.$new(ad.unionInfo);
    $scope.productList.addInitPromise(defer.promise);
    $scope.productList.pageSize = 20;
    $scope.listFilterData       = $scope.productList.filterOptions;
    $scope.selecteAll           = selecteAll;
    Shop.query().then(function(data) {
        $scope.productSources = $filter('filter')(data.items, shopFilter);
        if(data.items.length > 0) {
            $scope.productList.filterOptions.shopId = $scope.productSources[0].id;
        }
        defer.resolve();
    });
    $scope.actions = [
        {
            label        : '取消推广',
            icons        : 'fa fa-copy',
            class        : 'btn-primary',
            onClick      : cancelPromote,
        }
    ];
    function cancelPromote() {
        var items = [];
        angular.forEach($scope.productList.items, function(product) {
            if(product.ischecked == true) {
                items.push(product.numiid);
            }
        })
        ad.removeItems({shopId: $scope.productList.filterOptions.shopId,items:items}).then(function(data) {
            $route.reload();
        });
    }

    function shopFilter(shop) {
        return shop.app.platformCode == 'taobao';
    }
    function selecteAll(check) {
        if(check) {
            angular.forEach($scope.productList.items, function(product) {
                product.ischecked = true;
            })
        } else {
            angular.forEach($scope.productList.items, function(product) {
                product.ischecked = false;            })
        }
    }
}

/**
* @ngdoc controller
* @description 推广链接列表控制器
* @ngInject
*/
function UrlListCtrl($scope, $location, $filter, $q, adListNs, listFactory, ad, Shop) {
    var defer = $q.defer();
    $scope.list          = listFactory.$new(ad.urlList);
    $scope.list.addInitPromise(defer.promise);
    $scope.list.pageSize = 20;
    $scope.listFilterData       = $scope.list.filterOptions;
    Shop.query().then(function(data) {
        $scope.productSources = $filter('filter')(data.items, shopFilter);
        if(data.items.length > 0) {
            $scope.list.filterOptions.shopId = $scope.productSources[0].id;
        }
        defer.resolve();
    });
    function shopFilter(shop) {
        return shop.app.platformCode == 'taobao';
    }
}


})(window.angular);
