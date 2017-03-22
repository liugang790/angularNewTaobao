(function(angular,undefined){'use strict';

    angular.module('service.autoAdd.sync', [])
        .provider('autoSync', AutoSyncProvider);


    var provider;
    function AutoSyncProvider() {
        provider = this;

        this.$get = AutoSyncFactory;

        this.apiConfig = {
            hasLinkedListApi : { // 获取已经同步的商品列表
                url:'http://super.7ingu.com/SuperManager/stock/autoSync/hasLinked',
                method:'POST',
                cache: true
            },
            autoSyncApi : { // 同步商品
                url:'http://super.7ingu.com/SuperManager/stock/autoSync/',
                method:'POST',
                cache: true
            },
            allApi : { // 同步所有已关联的商品
                url:'http://super.7ingu.com/SuperManager/stock/autoSync/all',
                method:'POST',
                cache: true
            },
            cancelApi : { // 取消商品关联
                url:'http://super.7ingu.com/SuperManager/stock/autoSync/cancel',
                method:'POST',
                cache: true
            },
            cancelAllApi : {
                url:'http://super.7ingu.com/SuperManager/stock/autoSync/cancelAll',
                method:'POST',
                cache: true
            }
        };
    }

    /**
     * @ngInject
     */
    function AutoSyncFactory($q, $http) {
        var service = {
            hasLinkedList   : hasLinkedList,
            syncNow         : syncNow,
            cancelSync      : cancelSync,
            syncAllNow      : syncAllNow,
            cancelSyncAll   : cancelSyncAll,

        };
        return service;

        function hasLinkedList(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.hasLinkedListApi);
            httpConfig.data = params;
            $http(httpConfig).then(function(response){
                var items = angular.fromJson(angular.fromJson(response.data).data);
                if(items.success){
                    angular.forEach(items.data.items, function(item) {
                        if(item.linkPicUrl != undefined) item.linkPicUrl = item.linkPicUrl;
                        if(item.picUrl != undefined) item.picUrl = item.picUrl;
                        if(item.linkNumiid != undefined) item.linkUrl = 'https://item.taobao.com/item.htm?id=' + item.linkNumiid;
                    });
                    defer.resolve({items: items.data.items, total: items.data.totalPage});
                } else {
                    defer.reject({message:response.error});
                }
            });
            return defer.promise;
        }

        function syncNow(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.autoSyncApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(angular.fromJson(response.data).data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function cancelSync(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.cancelApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(response.data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function syncAllNow(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.allApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(angular.fromJson(response.data).data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

        function cancelSyncAll(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.cancelAllApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = angular.fromJson(response.data);
                defer.resolve({items: items});
                return defer.promise;
            })
        }

    }




})(window.angular);