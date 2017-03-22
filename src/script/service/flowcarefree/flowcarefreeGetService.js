(function(angular,undefined){'use strict';

  angular.module('service.flowcarefreeGetService',[])
     .provider('flowcarefreegetservice',flowcarefreegetservice);
    var URL = "http://super.7ingu.com";
    var TestURL = "http://192.168.18.105:8080";
    // var headers =  {'Content-Type': 'application/x-www-form-urlencoded'};
    var flowcarefreeGetservice;
     function flowcarefreegetservice() {
         flowcarefreeGetservice = this;
         this.$get = flowGetService;
         this.apiConfig = {
            flowgetserviceCategoryApi:{
                url:URL + '/SuperManager/a/category',
                method:'post',
                cache:true
            },
            flowgetserviceOnsaleApi:{
                url:URL + '/SuperManager/a/onsale',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceOnsaleListApi:{
                url:URL + '/SuperManager/a/onsaleList',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceShowItemsApi:{
                url:URL + '/SuperManager/a/show/items',
                method:'post',
                cache:true
            },
            flowgetserviceShowUrlApi:{
                url:URL + '/SuperManager/a/show/urls',
                method:'post',
                cache:true
            },
            flowgetserviceWechatListApi:{
                url:URL + '/SuperManager/a/wechat/list',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceGetSkuApi:{
                url:URL + '/SuperManager/a/getSku',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceGetPurchaseLogApi:{
                url:URL + '/SuperManager/a/getPurchaseLog',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceGetPurchaseFeeApi:{
                url:URL + '/SuperManager/a/getPurchaseFee',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceGetPurchaseConsumeLogApi:{
                url:URL + '/SuperManager/a/getPurchaseConsumeLog',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowgetserviceGetWechatPageApi:{
                url:URL + '/SuperManager/a/wechat/list/detail',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }
         };
     }
    function  flowGetService($q, $http) {
        var service = {
            rewardcategory       : rewardcategory,
            Onsale               : Onsale,
            OnsaleList           : OnsaleList,
            showItems            : showItems,
            showUrl              : showUrl,
            wechatList           : wechatList,
            wechatListover       : wechatListover,
            wechatListfaile      : wechatListfaile,
            getsku               : getsku,
            getPurchaseLog       : getPurchaseLog,
            getPurchaseFee       : getPurchaseFee,
            getPurchaseConsumeLog: getPurchaseConsumeLog,
            getWechatPage        : getWechatPage
        };
        return service;
        function rewardcategory(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceCategoryApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }

        function Onsale(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceOnsaleApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item = response.data.data.list;
                if(response.data.success == true){
                    defer.resolve({items:item,total:response.data.data.total});
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function OnsaleList(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceOnsaleListApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item = response.data.data.list;
                if(response.data.success == true){
                    defer.resolve({items:item,total:response.data.data.total});
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function showItems(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceShowItemsApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var items = response.data.data.itemList;
                var total = response.data.data.totalPage;
                if(response.data.success == true){
                    angular.forEach(items,function(item){
                        if(item.delivery_url != undefined){
                            item.itemData = true;
                        } else {
                            item.itemData = false;
                        }

                    });
                    defer.resolve({items:items,total:total});
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }

        
        function showUrl(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceShowUrlApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item = response.data.data.urlList;
                var total = response.data.data.totalPage;
                if(response.data.success == true){
                    defer.resolve({items:item,total:total});
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function wechatList(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceWechatListApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item = JSON.parse(response.data.data);
                if(response.data.success == true){
                    if(item.status == true){
                       defer.resolve({items:item.content.pages,total:item.content.pageCount}); 
                    }else {
                       defer.resolve({items:item.content,total:item.content.length}); 
                    }
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function wechatListover(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceWechatListApi);
            httpConfig.data = {status:1,pageSize:params.pageSize,pageNo:params.page};
            return $http(httpConfig).then(function(response){
                var itemData = JSON.parse(response.data.data);
                if(response.data.success == true){
                    if(itemData.status == true){
                       defer.resolve({items:itemData.content.pages,total:itemData.content.pageCount}); 
                    }else {
                       defer.resolve({items:itemData.content,total:itemData.content.length}); 
                    }
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function wechatListfaile(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceWechatListApi);
            httpConfig.data = {status:2,pageSize:params.pageSize,pageNo:params.page};
            return $http(httpConfig).then(function(response){
                var itemData = JSON.parse(response.data.data);
                if(response.data.success == true){
                    if(itemData.status == true){
                       defer.resolve({items:itemData.content.pages,total:itemData.content.pageCount}); 
                    }else {
                       defer.resolve({items:itemData.content,total:itemData.content.length}); 
                    }
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function getsku(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceGetSkuApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }

        function getPurchaseLog(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceGetPurchaseLogApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }

        function getPurchaseFee(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceGetPurchaseFeeApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        function getPurchaseConsumeLog(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceGetPurchaseConsumeLogApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }

        function getWechatPage(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeGetservice.apiConfig.flowgetserviceGetWechatPageApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }


        /**请求数据转换**/
        function serialize(obj, prefix) {
            var str = [], p;
            for(p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push((v !== null && typeof v === "object") ?
                        serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
            console.log(str);
            return str.join("&");  
        }
    }
})(window.angular);