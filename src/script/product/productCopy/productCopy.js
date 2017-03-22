(function(angular, undefined) {'use strict';

angular
    .module('product.copy', [])
    .config(Configure)
    .provider('productCopy', ProductCopyProvider)
    .directive('copyProductList', CopyProductListDirective)
    .controller('productCopyCreateTaskCtl', ProductCopyCreateTaskCtl)
    .controller('productCopySearchItemsCtl', ProductCopySearchItemsCtl)
    .controller('ProductCopyTaskDescCtrl', ProductCopyTaskDescCtrl)
;

var productCopyProvider;

/**
 * @ngInject
 */
function Configure($routeProvider) {
    $routeProvider
        .when('/product/copy/create-task', {
            templateUrl: '/src/script/product/productCopy/createTask.tpl.html',
            controller: 'productCopyCreateTaskCtl'
        });    
    $routeProvider
        .when('/product/copy/search-items', {
            templateUrl: '/src/script/product/productCopy/searchItems.tpl.html',
            controller: 'productCopySearchItemsCtl'
        });
}

/**
 * @ngInject
 */
function ProductCopyCreateTaskCtl($scope, $filter, createTask, Shop, $location, $uibModal, product, auth) {
    
    $scope.task = {
        urls: []
    };
    $scope.inputUrl = '';
    $scope.isLoading = false;

    $scope.onShopChange = onShopChange;
    $scope.shopFilter   = shopFilter;
    $scope.addUrl       = addUrl;
    $scope.createCopyTask = createCopyTask;
    $scope.deleteUrl = deleteUrl;

    function isDisabled() {
        if($scope.task.urls.length === 0 && $scope.wangwangId === '') {
            return true;
        }else{
            return false;
        }
    }

    function searchItems() {
        $scope.products.products = [];
        $scope.status.loading = true;
        if($scope.wangwangId === '') {
            queryFromSpider();
        }else{
            $scope.task.urls = [];
            queryFromWangwang();
        }
    }

    function pageChange() {
        if($scope.wangwangId === '') {
            queryFromSpider();
        }else{
            queryFromWangwang();
        }
    }
    
    function deleteUrl(item) {
        if(item ==='all') {
            $scope.task.urls = [];
            $scope.products.products = [];
        }else{
            if(item.url) {
                $scope.task.urls = $scope.task.urls.filter(function(value){
                    return value !== item.url;
                });
            }
            $scope.inputUrl = $scope.task.urls.join("\n");
            $scope.products.products = $scope.products.products.filter(function(value){
                if(value.url) {
                    return value.url !== item.url;
                }else{
                    return value.numiid !== item.numiid;
                }
            });
        }
    }

        function queryFromWangwang() {
            $.getShopItemList.process({ nick:$scope.wangwangId, keyword:'', pageNo:$scope.page, fn:function(totalNum, totalPage, data){
                $scope.products.products = data;
                angular.forEach(data, function(value){
                    $scope.task.urls.push('http://item.taobao.com?id='+value.numiid);
                });
                $scope.productsTotal = totalPage*data.length;
                $scope.status.loading = false;
            }});
        }


        function queryFromSpider() {
            $scope.productsTotal = $scope.task.urls.length;
            var skip = ($scope.page-1) * $scope.pageSize;
            var urls = $scope.task.urls.slice(skip, $scope.pageSize);

            if(urls.length > 0) {
                angular.forEach(urls, function(url){
                    product.spiderGet({url:url}).then(function(data){
                        data.url = url;
                        data.picUrl = data.logo;
                        $scope.products.products.push(data);
                    });
                });
            }
            $scope.status.loading = false;
        }
        

    if($location.search().itemUrl && $location.search().platform) {
        Shop.query().then(function(data) {
            if(data.total == 0) {
                $uibModal.open({
                    templateUrl: '/src/script/product/productCopy/noshop.tpl.html',
                    size: 'md'
                });
            }else{
                var hasShop = false;
                angular.forEach(data.items, function(item) {
                    if($location.search().platform == item.app.platformCode) {
                        hasShop = true;
                    }
                })
                if(hasShop == false) {
                    $uibModal.open({
                        templateUrl: '/src/script/product/productCopy/noshop.tpl.html',
                        size: 'md'
                    });
                }
            }
        });
        $scope.inputUrl = $location.search().itemUrl;
    }

    function addUrl() {
        $scope.task.urls = [];
        if(!$scope.inputUrl) {
            return;
        }
        $scope.notifyMsg = false;
        $scope.isLoading = false;
        var re = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/i;
        var urls = $scope.inputUrl.split("\n");
        angular.forEach(urls, function(url, index){
            if(re.test(url) || url.search('yinong') != -1) {
                var check = $filter('filter')($scope.task.urls, url);
                if(check.length <= 0) {
                    $scope.task.urls.push(url);
                }
            }else{
                $scope.notifyMsg = '商品链接错误:' + url;
                $scope.isLoading = true;
                return false;
            }
        });
    }

    function createCopyTask() {
        addUrl();
        if(($scope.task.shop.app.platformCode == 'taobao'
            || $scope.task.shop.app.platformCode == 'jd'
            || $scope.task.shop.app.platformCode == 'suning'
            || $scope.task.shop.app.platformCode == 'tyfo')
            && !$scope.task.shop.category
        ) {
            $scope.notifyMsg = '请选择要复制到的分类！';
            return false;
        }

        if((($scope.task.shop.app.platformCode == 'jd' && $scope.task.shop.level1Cid != 1713 && $scope.task.shop.level1Cid != 4053 && $scope.task.shop.level1Cid != 5272)
            || $scope.task.shop.app.platformCode == 'suning')
            && !$scope.task.shop.brand
        ) {
            $scope.notifyMsg = '请选择要复制到的品牌！';
            return false;
        }

        if(Object.keys($scope.task.shop).length === 0 || $scope.task.urls.length === 0) {
            $scope.notifyMsg = '请至少添加一个商品链接，并且选择目标店铺！';
            return false;
        }
        $scope.isLoading = true;
        $scope.notifyMsg = false;
        var taskData ={
            urls: $scope.task.urls,
            shopId: $scope.task.shop.id
        };
        if($scope.task.shop.category) taskData.cid = $scope.task.shop.category;
        if(!$scope.task.shop.category) {
            if($scope.task.shop.level3Cid) {
                if(angular.isObject($scope.task.shop.level3Cid)) {
                   taskData.cid = $scope.task.shop.level3Cid.cid; 
                }else{
                    taskData.cid = $scope.task.shop.level3Cid; 
                } 
            }else{
                if($scope.task.shop.level2Cid) {
                    if(angular.isObject($scope.task.shop.level2Cid)) {
                       taskData.cid = $scope.task.shop.level2Cid.cid; 
                    }else{
                        taskData.cid = $scope.task.shop.level2Cid; 
                    } 
                }
            }
        }
        if($scope.task.shop.brand) taskData.bid = $scope.task.shop.brand;
        var startModal = $uibModal.open({
            templateUrl: '/src/script/product/productCopy/copyStart.tpl.html',
            size: 'md'
        });
        createTask.createCopyTask(taskData).then(function(data){
            startModal.close();
            $scope.inputUrl = '';
            $scope.task.urls = [];
            $scope.isLoading = false;
            $uibModal.open({
                templateUrl: '/src/script/product/productCopy/copyEnd.tpl.html',
                size: 'md'
            });
        }, function(response) {
            $scope.isLoading = false;
            $scope.notifyMsg = response.data['errorMessage'];
        });  
        
    }

    function onShopChange (shop) {
        
    }

    function shopFilter(shop) {
        return (shop.app.platformCode == 'weidian' 
            || shop.app.platformCode == 'youzan' 
            || shop.app.platformCode == 'jd' 
            || shop.app.platformCode == 'taobao' 
            || shop.app.platformCode == 'suning'
            || shop.app.platformCode == 'dian121'
            || shop.app.platformCode == 'tyfo'
        );
    }
}

function ProductCopyProvider() {
    productCopyProvider = this;
    this.$get = ProductCopy;
    this.allowAppCodes = [];    // 当前支持的应用代码
    this.apiConfig = {
        copy: {
            url: '/restApi/product-copy/copy',
            method: 'POST'
        }
    };
    this.searchItemsApi   = 'taobao.items.search';
    this.getCopyCountApi = 'productcopy.cancopy.count';
}

/**
 * @ngInject
 */
function ProductCopy($http, $q, apiClient, appConfig) {
    var service = {
        copy: copyProduct,
        searchItems: searchItems,
        copyCount: copyCount
    };
    return service;

    function copyProduct(originUrl, shopId, options) {
        if(!angular.isObject(options)) {
            options = {};
        }
        var postData = angular.extend(options, {
            url: originUrl,
            shopId: shopId
        });
        var httpConfig = angular.copy(productCopyProvider.apiConfig.copy);
        httpConfig.data = postData;
        return $http(httpConfig).then(function(response) {
            return response.data.data.product;
        });
    }

    function searchItems(params) {
        var defer = $q.defer();
        if(!angular.isUndefined(appConfig.code) && appConfig.code==='yinong') {
            if(!params.nick && !params.q) {
                defer.resolve({items: [], total: 0});
                return defer.promise;
            }else{
                return apiClient.$new('yinong.items.query').send(params).then(function(data){
                    return data;
                });
            }
        }else{
            var processFn = function(totalNum, totalPage, array) {
                defer.resolve({items:array, total:totalNum});
            }
            if(params.nick) {
                $.getShopItemList.process({ nick:params.nick, keyword:params.q, pageNo:params.pageNo, fn:processFn}); 
            }else{
                defer.resolve({items: [], total: 0});
            }
            return defer.promise;
        }
    }

    function copyCount(params) {
        return apiClient.$new(productCopyProvider.getCopyCountApi).send(params).then(function(response){
            return response;
        });
    }
}

function CopyProductListDirective() {
    return {
        restrice: 'E',
        templateUrl: '/src/script/product/productCopy/list.directive.tpl.html',
        scope: {
            listItems: "=",
            deleteUrl: "=ngClick"
        }
    };
}

/**
* @ngInject
*/
function ProductCopyTaskDescCtrl($scope, product) {
    if($scope.task.desc.originUrl) {
        product.spiderGet({url:$scope.task.desc.originUrl}).then(function(data){
            $scope.product = data;
            $scope.product.url = $scope.task.desc.originUrl;
        });
    }
}

/**
* @ngInject
*/
function ProductCopySearchItemsCtl($scope, $filter, $location, $window, $q, listFactory, productCopy, Shop, appConfig) {
    var defer = $q.defer();
    $scope.productList          = listFactory.$new(productCopy.searchItems);
    $scope.productList.pageSize = 20;
    $scope.listFilterData       = $scope.productList.filterOptions;
    $scope.selecteAll           = selecteAll;
    $scope.getProductUrl        = getProductUrl; 
    $scope.actions = [
        {
            label        : '复制选中商品',
            icons        : 'fa fa-copy',
            class        : 'btn-primary',
            onClick      : copy,
        }
    ];
    function selecteAll(check) {
        if(check) {
            angular.forEach($scope.productList.items, function(product) {
                product.isInbox = true;
            })
        } else {
            angular.forEach($scope.productList.items, function(product) {
                product.isInbox = false;
            })
        }
    }
    function copy() {
        var urls = [];
        if(!angular.isUndefined(appConfig.code) && appConfig.code==='yinong') {
            angular.forEach($scope.productList.items, function(product) {
                if(product.isInbox) {
                    urls.push(product.itemUrl);
                }
            });
        }else {
            angular.forEach($scope.productList.items, function(product) {
                if(product.isInbox) {
                    urls.push('https://item.taobao.com/item.htm?id=' + product.numiid);
                }
            });
        }
        $location.url('/product/copy/create-task?platform=taobao&itemUrl=' + $window.encodeURIComponent(urls.join("\n")));
    }

    function getProductUrl(product) {
        if(!angular.isUndefined(appConfig.code) && appConfig.code === 'yinong') {
            return 'http://sources.yn12316.net/detail/'+product.numIid;
        }else{
            return 'https://item.taobao.com/item.htm?id=' + product.numiid;
        }
    }
}

})(window.angular);
