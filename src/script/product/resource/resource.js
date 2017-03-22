(function(angular, undefined) {
    'use strict';

    angular
        .module('product.resource', ['product.resource.source'])
        /**
         * @method query(Object where)[]Product 查询符合条件的商品数据
         * @method $new(Object productData) 创建一个商品实例
         */
        .provider('product', ProductResourceProvider);

    // 商品资源product实例
    var resourceProvider;

    /**
     * @ngdoc provider
     * @name productProvider
     */
    function ProductResourceProvider() {
        resourceProvider = this;
        this.$get = ProductResource;

        this.apiConfig = {
            queryApi: {
                url: '/restApi/product/query',
                method: 'POST',
                cache: true
            },
            spiderGetApi: {
                url: '/restApi/spider/get-item',
                method: 'POST',
                cache: true
            },
            getPicApi: {
                url: '/restApi/product/get-pic',
                method: 'POST',
                cache: true
            },
            getApi: {
                url: '/restApi/product/get',
                method: 'POST',
                cache: true
            }
        };
    }

    /**
     * @ngdoc service
     * @ngInject
     * @name product
     */
    function ProductResource($http, shopFactory) {
        var resource = {
            query: queryProducts,
            spiderGet: spiderGet,
            getPic: getPic,
            get: get,
            $new: createProduct
        };
        return resource;


        function queryProducts(params) {
            var postData = angular.copy(params);
            postData.databaseType = params.source.typeCode;
            postData.databaseValue = params.source.value;
            var httpConfig = angular.copy(resourceProvider.apiConfig.queryApi);
            httpConfig.data = postData;
            return $http(httpConfig).then(function(response) {
                var products = [];
                angular.forEach(response.data.data.items, function(item) {
                    products.push(resource.$new(item));
                });
                return {
                    items: products,
                    total: response.data.data.total
                };
            });
        }

        function getPic(params) {
            var httpConfig = angular.copy(resourceProvider.apiConfig.getPicApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response) {
                return response.data.data;
            });
        }

        function get(params){
            var httpConfig = angular.copy(resourceProvider.apiConfig.getApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response) {
                return response.data.data.product;
            });
        };

        function spiderGet(params) {
            var httpConfig = angular.copy(resourceProvider.apiConfig.spiderGetApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response) {
                return response.data.data.product;
            });
        }

        function createProduct(data) {
            angular.forEach(data.platformItems, function(platformItem) {
                platformItem.shop = shopFactory.$new(platformItem.shop);
            });
            if(typeof data.source.shop !== 'undefined'){
                data.source.shop = shopFactory.$new(data.source.shop);
            }
            return new Product(data);
        }
    }

    function Product(data) {
        angular.extend(this, data);

        var self = this;

        this.getOnsaleShops = getOnsaleShops;
        this.getUniqueId    = getUniqueId;
        this.getDescUrl     = getDescUrl;
        //this.getSource      = getSource;
        this.uniqueId       = this.getUniqueId();
        this.descUrl        = this.getDescUrl();

        var shops = [];

        function getUniqueId() {
            if(self.source.typeCode === 'spider') {
                return self.source.typeCode + ':' + self.platformItems[0].wareId;
            }else {
                return self.source.typeCode + ':' + self.source.wareId;
            }
        }

        /**
         * 返回当前商品的原始来源店信息
         */
        function getSource() {
            if(angular.isUndefined(self.source)) {
                angular.forEach(self.platformItems, function(item) {
                    if(item.isSource) {
                        self.source = item;
                    }
                })
            }
            if(!self.source) {
                self.source = self.platformItems[0];
            }
            return self.source;
        }

        /**
         * 返回出售当前商品的所有店铺对象
         * @return {[]Shop}
         */
        function getOnsaleShops() {
            if (shops.length < 1) {
                angular.forEach(this.platformItems, function(platformItem) {
                    var s = shops.filter(function(value){
                        return value.id === platformItem.shop.id
                    });
                    if(s.length <= 0){
                        shops.push(platformItem.shop);
                    }
                });
            }
            return shops;
        }

        function getDescUrl() {
            if(self.source.typeCode === 'spider'){
                return '/product/desc/' + self.platformItems[0].wareId + '/';
            }else{
                return '/product/desc/' + self.source.wareId + '/';
            }
        }
    }
})(window.angular);
