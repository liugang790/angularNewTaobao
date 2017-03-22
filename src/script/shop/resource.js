(function(angular, undefined) {
    'use strict';

    /**
     * @ngdoc module
     * @name shop
     * @description 提供与店铺管理相关的功能
     */
    angular
        .module('shop.resource', [])
        .provider('Shop', ShopProvider)
        .provider('shopSubscribe', ShopSubscribeProvider)
        .provider('shopCardManager', ShopCardManagerProvider)
        .service('shopFactory', ShopFactory)
        .constant('shopCategoryTpls', {
            jd:     '/src/script/shop/category/jd.category.tpl.html',
            taobao: '/src/script/shop/category/taobao.category.tpl.html',
            suning: '/src/script/shop/category/suning.category.tpl.html',
            weidian:'/src/script/shop/category/weidian.category.tpl.html',
            youzan: '/src/script/shop/category/youzan.category.tpl.html',
            tyfo: '/src/script/shop/category/tyfo.category.tpl.html'
        })
    ;

    var subscribeProvider;

    /**
     * 提供店铺的应用订购信息管理
     * @ngInject
     */
    function ShopSubscribeProvider() {
        subscribeProvider = this;
        this.$get = Subscribe;
        this.apis = {
            check: 'shop.subscribe.check'
        };
    }

    /**
     * @ngInject
     */
    function Subscribe(apiClient) {
        var service = {
            check: check
        };
        return service;

        function check(appCode, pid) {
            return apiClient.$new('shop.subscribe.check').send({
                appCode: appCode,
                pid: pid
            });
        }
    }

    /**
     * @ngInject
     */
    function ShopCardManagerProvider() {

        var provider = this;
        this.$get    = ShopCardManager;

        /**
         * 店铺卡片配置
         * @type {Object}
         */
        this.cardConfig = {
            bgs: ['info', 'primary', 'success', 'warning', 'danger'],
            icons: [
                'iconfont icon-shop',
                'iconfont icon-goods',
                'iconfont icon-order',
                'iconfont icon-dazahui',
                'iconfont icon-sheyinglvxing',
                'iconfont icon-gaoxiaoquwei',
                'iconfont icon-mingxing',
                'iconfont icon-chongwu',
                'iconfont icon-DIY',
                'iconfont icon-meishi',
                'iconfont icon-qinggan',
                'iconfont icon-muying',
                'iconfont icon-jiaju',
                'iconfont icon-meifa',
                'iconfont icon-meirong',
                'iconfont icon-shuma',
                'iconfont icon-shishang',
                'iconfont icon-yundonghuwai',
                'iconfont icon-nanzhuang',
                'iconfont icon-peishi',
                'iconfont icon-xiezi',
                'iconfont icon-nvzhuang',
                'iconfont icon-baobao'
            ]
        }

        function ShopCardManager() {
            return {
                getCardConfig: getCardConfig
            };

            /**
             * 返回店铺卡片配置
             * @return {Object}
             */
            function getCardConfig() {
                return provider.cardConfig;
            }
        }
    }

    /**
     * 店铺实体创建工厂
     * @ngInject
     */
    function ShopFactory(shopCardManager, $window) {
        var service = {
            $new: createShop
        };
        return service;

        function createShop(data) {
            return new ShopEntity(data);
        }

        /**
         * 店铺实体对象
         */
        function ShopEntity(data) {
            angular.extend(this, data);

            this.getCardStyle = getCardStyle;
            this.setCardStyle = setCardStyle;
            this.getCardIcon  = getCardIcon;
            this.setCardIcon  = setCardIcon;

            var entity = this;
            var cacheKey = 'shopui' + this.id;

            /**
             * 返回当前店铺的卡片样式
             * @return {String}
             */
            function getCardStyle() {
                return getUiSetting().cardStyle;
            }

            function setCardStyle(style) {
                var setting = getUiSetting();
                setting.cardStyle = style;
                setUiSetting(setting);
            }

            /**
             * 返回当前店铺的卡片图标
             * @return {String}
             */
            function getCardIcon() {
                return getUiSetting().cardIcon;
            }

            function setCardIcon(icon) {
                var setting = getUiSetting();
                setting.cardIcon = icon;
                setUiSetting(setting);
            }

            function getUiSetting() {
                var uiSetting = {
                    cardStyle: shopCardManager.getCardConfig().bgs[0],
                    cardIcon: shopCardManager.getCardConfig().icons[0]
                };
                if(!angular.isUndefined($window.localStorage[cacheKey])) {
                    uiSetting = angular.fromJson($window.localStorage[cacheKey]);
                }
                return uiSetting;
            }

            function setUiSetting(setting) {
                $window.localStorage[cacheKey] = angular.toJson(setting);
            }
        }
    }

    /**
     * @ngdoc provider
     * @ngInject
     * @description
     *
     * 管理店铺服务的所有请求
     */
    function ShopProvider() {
        this.apiConfig = {
            queryConfig : {
                url: '/restApi/shop/query',
                cache: true,
                method: 'POST',
                data: {}
            },
            getCatConfig : {
                url: '/restApi/shop/get-category',
                cache: true,
                method: 'POST'
            },
            getBrandsConfig : {
                url: '/restApi/shop/get-brands',
                cache: true,
                method: 'POST'
            }
        };
        this.getAreaApiName = 'shop.areas.get';
        this.$get = ShopFactory;
        var provider = this;

        /**
         * @ngInject
         */
        function ShopFactory($http, $q, oauth, auth, shopFactory, apiClient) {
            var shopService = {
                query : queryShops,
                getCategorys : getCategorys,
                getBrands : getBrands,
                getAreas : getAreas
            };
            return shopService;

            function queryShops(params) {
                if(!angular.isObject(params)) {
                    params = {};
                }

                return auth.currentUser({cache:false}).then(function() {
                    return doQueryShops(params);
                }, function() {
                    var shopIds = auth.getAdapter().getData().bindTokens;
                    if(!angular.isArray(shopIds)) {
                        return {
                            items: [],
                            total: 0
                        };
                    }

                    params.ids = shopIds;
                    return doQueryShops(params);
                })
            }

            function doQueryShops(params) {
                var httpConfig = provider.apiConfig.queryConfig;
                httpConfig.data = angular.extend(httpConfig.data, params);
                return $http(httpConfig).then(function(response) {
                    var items = [];
                    angular.forEach(response.data.data.shops, function(item) {
                        items.push(shopFactory.$new(item));
                    });
                    var data = {
                        total: response.data.data.total,
                        items: items
                    };
                    return data;
                });
            }

            function getCategorys(params){
                var httpConfig = provider.apiConfig.getCatConfig;
                httpConfig.data = params;
                return $http(httpConfig).then(function(response){
                    return response.data.data;
                });
            }
            function getBrands(params){
                var httpConfig = provider.apiConfig.getBrandsConfig;
                httpConfig.data = params;
                return $http(httpConfig).then(function(response){
                    return response.data.data;
                });
            }
            function getAreas(params) {
                var result = [];
                return apiClient.$new(provider.getAreaApiName).send(params).then(function(response){
                    angular.forEach(response.areas, function(value){
                        if(angular.isUndefined(result[value.regionCode])) {
                            result[value.regionCode] = {
                                name: value.regionName,
                                provinces: [{code: value.areaCode, name: value.areaName}]
                            };
                        }else {
                            result[value.regionCode].provinces.push({code: value.areaCode, name: value.areaName});
                        }
                    });
                    return result;
                });
            }
        }
    }
})(window.angular);
