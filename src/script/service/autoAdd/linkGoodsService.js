(function(angular,undefined){'use strict';

    angular.module('service.autoAdd.link', [])
        .provider('link', linkProvider);


    var provider;
    function linkProvider() {
        provider = this;

        this.$get = linkFactory;

        this.apiConfig = {
            goodsListApi : { // 获取商品列表
                url:'http://super.7ingu.com/SuperManager/stock/autoSync/goods/page',
                method:'POST',
                cache: true
            },
            skusListApi : {  // 根据numiid获取商品Skus
                url:'http://super.7ingu.com/SuperManager/stock/properties/goods',
                method:'POST',
                cache: true
            },
            linkSkusApi : {  // 根据numiid和linkNumiid获取商品Skus
                url:'http://super.7ingu.com/SuperManager/stock/properties/goods/link',
                method:'POST',
                cache: true
            },
            saveSkusApi : {  // 保存关联商品Skus信息
                url:'http://super.7ingu.com/SuperManager/stock/properties/goods/link/save',
                method:'POST',
                cache: true
            },
            delLinkGoodsApi : {  // 删除关联商品
                url:'http://super.7ingu.com/SuperManager/stock/properties/goods/link/del',
                method:'POST',
                cache: true
            },

        };
    }

    /**
     * @ngInject
     */
    function linkFactory($q, $http) {
        var service = {
            goodsList : goodsList,
            skusList : skusList,
            linkSkus : linkSkus,
            saveSkus : saveSkus,
            delLinkGoods : delLinkGoods
        };
        return service;

        function goodsList(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.goodsListApi);
            httpConfig.data = params;
            $http(httpConfig).then(function(response){
                var items = angular.fromJson(angular.fromJson(response.data).data);
                if(items.success){
                    angular.forEach(items.data.items, function(item) {
                        item.isShow = false; // 默认不展示
                        if(item.linkPicUrl != undefined) item.linkPicUrl = item.linkPicUrl;
                        if(item.picUrl != undefined) item.picUrl = item.picUrl;
                        item.modify = false;
                        if(item.linkNumiid != undefined) item.linkUrl = 'https://item.taobao.com/item.htm?id=' + item.linkNumiid;
                    });
                    console.log(items);
                    defer.resolve({items: items.data.items, total: items.data.totalPage});
                } else {
                    defer.reject({message:response.error});
                }
            });
            return defer.promise;
        }

        function skusList(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.skusListApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(angular.fromJson(response.data).data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function linkSkus(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.linkSkusApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(response.data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function saveSkus(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.saveSkusApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(angular.fromJson(response.data).data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function delLinkGoods(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.delLinkGoodsApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                console.log(response.data);
                defer.resolve({items: response.data});
                return defer.promise;
            })
        }
    }




})(window.angular);