(function(angular, undefined) {
    'use strict';

    /**
     * @ngdoc module
     * @name shop
     * @description 提供与店铺管理相关的功能
     */
    angular
        .module('shop', ['shop.resource'])
        .config(Configure)
        .directive('shopSelectNew', ShopSelectNewDirective)
        .directive('shopCard', ShopCardDirective)
        .directive('shopCardEditor', ShopCardEditorDirective)
        .directive('shopIconList', ShopIconListDirective)
        .directive('shopCategory', ShopCategoryDirective)
        .controller('shopListCtrl', ShopListCtrl)
        .controller('shopIconListItemCtrl', ShopIconListItemCtrl)
        .controller('ShopCategoryCtrl', ShopCategoryCtrl);

    /**
     * @ngdoc config
     * @ngInject
     */
    function Configure($stateProvider) {
        $stateProvider
            .state('shop', {
                url: '/shop'
            })
            .state('shop.list', {
                url: '/list',
                templateUrl: '/src/script/shop/list.tpl.html',
                controller: 'shopListCtrl'
            });
    }

    /**
     * @ngdoc controller
     * @ngInject
     * @description
     * 管理店铺列表，获取店铺列表，添加新的店铺
     */
    function ShopListCtrl($scope, listFactory, Shop, oauth) {
        $scope.shopList = listFactory.$new(Shop.query);
        $scope.Shop = Shop;
        $scope.shopFilters = {};
        $scope.shops = [];
        // @TODO: 进入控制器后应该检查本地缓存中是否存在用户设置的列表类型进行切换
        $scope.listType = 'card';
        $scope.onChangeListType = onChangeListType;
        $scope.listBodyTemplateUrl = '';

        getListBodyTemplateUrl($scope.listType);

        // @TODO: 当用户切换列表样式后需要将用户选择存入本地缓存
        function onChangeListType(listType) {
            getListBodyTemplateUrl(listType);
        }

        $scope.oauthStatus = 'loading';
        oauth.apps().then(function(data) {
            $scope.oauthApps = data;
            $scope.oauthStatus = 'complete';
        });

        function getListBodyTemplateUrl(listType) {
            if (listType === 'card') {
                $scope.listBodyTemplateUrl = '/src/script/shop/list.card.tpl.html';
            } else {
                $scope.listBodyTemplateUrl = '/src/script/shop/list.table.tpl.html';
            }
        }
    }

    /**
     * @ngdoc directive
     * @name shopCard
     * @description 店铺卡片指令
     */
    function ShopCardDirective() {
        return {
            restrict   : 'E',
            replace: true,
            transclude : true,
            templateUrl: '/src/script/shop/card.tpl.html',
            controller : ShopCardDirectiveCtrl,
            scope      : {
                shop    : "=",
                readOnly: "="   // 是否只读模式
            },
        };
    }

    /**
     * @ngInject
     */
    function ShopCardDirectiveCtrl($scope, $filter, oauth) {;
        oauth.apps().then(function(apps) {
            var app = $filter('filter')(apps, {code: $scope.shop.app.code});
            if(app.length > 0) {
                $scope.authUrl = app[0].authUrl;
            }
        })
    }

    function ShopCardEditorDirective() {
        return {
            restrict   : 'E',
            templateUrl: '/src/script/shop/cardEditor.tpl.html',
            controller : ShopCardEditorDirectiveCtrl,
            scope      : {
                shop: '='
            }
        }
    }

    /**
     * @ngInject
     */
    function ShopCardEditorDirectiveCtrl($scope, shopCardManager) {
        $scope.cardConfig = shopCardManager.getCardConfig();
    }

    function ShopIconListDirective() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/src/script/shop/iconList.tpl.html',
            scope: {
                shops: "="
            }
        }
    }

    function ShopSelectNewDirective() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            templateUrl: '/src/script/shop/selectNew.tpl.html',
            controller: ShopSelectNewCtrl,
            scope: {
                shopModel      : "=", // 当前选择店铺存储
                filter         : "=", // 可选店铺过滤器
                defaultLabel   : "@", // 空选项标题
                disabledDefault: '=', // 是否关闭空选项
                shopChange     : "&"
            },
            compile: function(element, attrs, transclude) {
                var privateAttrs = ['shopModel', 'filter', 'defaultLabel', 'disabledDefault', 'shopChange'];
                angular.forEach(attrs.$attr, function(name, key) {
                    if(privateAttrs.indexOf(key) !== -1) {
                        return;
                    }
                    element.find('select').attr(name, attrs[key]);
                })
            }
        }
    }

    /**
     * @ngInject
     */
    function ShopSelectNewCtrl($scope, $filter, Shop) {
        $scope.shops               = [];
        $scope.status              = 'loading';
        $scope.isLoading           = isLoading;
        $scope.isEmpty             = isEmpty;
        $scope.getDefaultLabel     = getDefaultLabel;
        $scope.isShowDefaultOption = isShowDefaultOption;
        $scope.onChange            = onChange;

        var parentOnChange = $scope.shopChange();

        Shop.query().then(function(data) {
            $scope.status = 'loaded';
            if(angular.isObject($scope.filter) || angular.isFunction($scope.filter)) {
                $scope.shops = $filter('filter')(data.items, $scope.filter);
            } else {
                $scope.shops = data.items;
            }
            if($scope.disabledDefault && !$scope.isEmpty()) {
                $scope.shopModel = $scope.shops[0];
                $scope.onChange($scope.shopModel);
            }
        });

        function hasOnChange() {
            return !angular.isUndefined(parentOnChange);
        }

        function onChange(shop) {
            if(!hasOnChange()) {
                return;
            }
            parentOnChange(shop);
        }

        function isShowDefaultOption() {
            if(isEmpty()) {
                return true;
            }
            return !$scope.disabledDefault;
        }

        function getDefaultLabel() {
            if(isEmpty()) {
                return '没有可选择店铺';
            }
            return $scope.defaultLabel;
        }

        function isLoading() {
            return ($scope.status === 'loading');
        }

        function isEmpty() {
            return (!isLoading() && $scope.shops.length < 1)
        }
    }

    /**
     * @ngInject
     */
    function ShopIconListItemCtrl($scope) {
        $scope.showCard = false;
    }

    function ShopCategoryDirective() {
        return {
            restrict: 'E',
            templateUrl: '/src/script/shop/category/category.directive.tpl.html',
            scope: {
                shop: "="
            },
            controller: 'ShopCategoryCtrl'
        };
    }

    /**
    * @ngInject
    */
    function ShopCategoryCtrl($scope, shopCategoryTpls, Shop) {
        $scope.shopCategoryTpls = shopCategoryTpls;
        $scope.catParams = {shopId: ''};
        $scope.categoryLoading = true;

        $scope.$watch(function(){return $scope.shop;}, function(newValue, oldValue){
            if($scope.shop) {
                $scope.catParams.shopId = $scope.shop.id;
                if($scope.shop.app.platformCode === 'taobao'){
                    $scope.catParams.parentCid = 0;
                }

                Shop.getCategorys($scope.catParams).then(function(data){
                    $scope.categorys = data;
                    if($scope.shop.app.platformCode === 'jd' || $scope.shop.app.platformCode === 'suning'){
                        Shop.getBrands({shopId: $scope.shop.id}).then(function(data){
                            $scope.brands = data;
                            $scope.errorMessage = false;
                        },function(error){
                            $scope.errorMessage = error.data.errorMessage;
                        });
                    }
                    $scope.categoryLoading = false;
                });
            }

        });

        $scope.getLevelCat = function(category) {
            if(!angular.isUndefined(category) && category) {
                if(category.is_parent){
                   $scope.catParams.parentCid = category.cid;
                    Shop.getCategorys($scope.catParams).then(function(data){
                        angular.forEach(data, function(value, key){
                            $scope.categorys.push(value);
                        });
                    }); 
                }else{
                    $scope.shop.category = category.cid;
                }
            }
        }

        $scope.getBrands = function(cid, level){
            var childs = $scope.categorys.filter(function(item){
                return item.FPC_FatherID === cid;
            });
            if(childs.length <= 0) {
                $scope.shop.category = cid;
                Shop.getBrands({shopId: $scope.shop.id, cid: cid}).then(function(data){console.log(data);
                    $scope.brands = data;
                });
            }else{
                $scope['level'+(level+1)+'show'] = true;
            }
        }

        $scope.tbLevel1FilterComparator = function(actual, expected){
            return angular.equals(actual, expected);
        }

        $scope.tbLevel3FilterComparator = function(actual, expected){
            if(angular.equals(actual, expected)){
                $scope.level3SelectShow = true;
                return true;
            }else{
                $scope.level3SelectShow = false;
                return false;
            }
        }

        $scope.tbLevel4FilterComparator = function(actual, expected){
            if(angular.equals(actual, expected)){
                $scope.level4SelectShow = true;
                return true;
            }else{
                $scope.level4SelectShow = false;
                return false;
            }
        }
    }

})(window.angular);
