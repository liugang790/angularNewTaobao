(function(angular,undefined){'use strict';

    angular.module('service.autoAdd.add', [])
        .provider('autoAdd', AutoAddProvider);


    var provider;
    function AutoAddProvider() {
        provider = this;

        this.$get = AutoAddFactory;

        this.apiConfig = {
            getSettingApi : {
                url:'http://super.7ingu.com/SuperManager/stock/autoAdd/settingInfo',
                method:'POST',
                cache: true
            },
            saveSettingApi : {
                url:'http://super.7ingu.com/SuperManager/stock/autoAdd/add',
                method:'POST',
                cache: true
            },
            onSaleListApi : {
                url:'http://super.7ingu.com/SuperManager/stock/autoAdd/goods/',
                method:'POST',
                cache: true
            },
            addStockGoodsApi : {
                url:'http://super.7ingu.com/SuperManager/stock/autoAdd/addStockGoods',
                method:'POST',
                cache: true
            },
            delStockGoodsApi : {
                url:'http://super.7ingu.com/SuperManager/stock/autoAdd/delStockGoods',
                method:'POST',
                cache: true
            }
        };
    }

    /**
     * @ngInject
     */
    function AutoAddFactory($q, $http) {
        var service = {
            getSetting : getSetting,
            saveSetting : saveSetting,
            onSaleList : onSaleList,
            addStockGoods : addStockGoods,
            delStockGoods : delStockGoods
        };
        return service;

        function getSetting(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.getSettingApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }

        function saveSetting(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.saveSettingApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }

        function onSaleList(params){
            var defer = $q.defer();
            var url = "http://super.7ingu.com/SuperManager/stock/autoAdd/goods/" + params.pageNo;
            provider.apiConfig.onSaleListApi.url = url;
            var httpConfig = angular.copy(provider.apiConfig.onSaleListApi);
            httpConfig.data = params;
            $http(httpConfig).then(function(response){
                console.log(response);
                if(response.data.success){
                    var data = angular.fromJson(response.data.data);
                    if(data.success){
                        var items = data.data;
                        items = angular.fromJson(items);
                        console.log(items);
                        angular.forEach(items.itemsMap, function(item) {
                            item.selected = false; // 默认未选中
                            item.picUrl = item.picUrl + '_50x50.jpg_.webp';
                        });
                        defer.resolve({items: items.itemsMap, total : items.totalPage});
                    } else {
                        defer.reject({message:response.data.error});
                    }
                } else {
                    defer.reject({message:response.error});
                }
            });
            return defer.promise;
        }

        function addStockGoods(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.addStockGoodsApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = response.data;
                items = angular.fromJson(items);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function delStockGoods(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.delStockGoodsApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = response.data.data;
                items = angular.fromJson(items);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

    }




})(window.angular);