(function(angular,undefined){'use strict';

  angular.module('service.flowcarefreeTask',[])
     .provider('flowcarefreetask',flowcarefreetask);
    var URL = "http://super.7ingu.com";
    var TestURL = "http://192.168.18.105:8080";
    var flowcarefreeTaskservice;
     function flowcarefreetask() {
         flowcarefreeTaskservice = this;
         this.$get = flowGetService;
         this.apiConfig = {
            flowcarefreetaskserviceSetShopcateApi:{
                url:URL + '/SuperManager/a/setShopcate',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowcarefreeTaskserviceputAdApi:{
                url:URL + '/SuperManager/a/putAd',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowcarefreeTaskserviceShowItemsdelApi:{
                url:URL + '/SuperManager/a/show/items/del',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowcarefreeTaskserviceShowItemsHomeaddApi:{
                url:URL + '/SuperManager/a/show/items/home/add',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowcarefreeTaskserviceShowItemsHomedelApi:{
                url:URL + '/SuperManager/a/show/items/home/del',
                method:'post',
                cache:true,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowcarefreeTaskserviceDelItemsApi:{
                 url:URL + '/SuperManager/a/show/items/del',
                 method:'post',
                 cache:true,
                 headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
            flowcarefreeTaskserviceShowItemsHomeHeadApi:{
                 url:URL + '/SuperManager/a/show/items/home/head',
                 method:'post',
                 cache:true,
                 headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            },
             flowcarefreeTaskservicewechatPayApi:{
                 url:URL + '/SuperManager/a/wechat/pay',
                 method:'post',
                 cache:true,
                 headers: {'Content-Type': 'application/x-www-form-urlencoded'}
             },
             flowcarefreeTaskservicegetPurchaseUrlApi:{
                 url:URL + '/SuperManager/a/getPurchaseUrl',
                 method:'post',
                 cache:true
             }
         };
     }
     function  flowGetService($q, $http) {
        var service = {
            setShopcate       : setShopcate,
            putAd             : putAd,
            showItemsDel      : showItemsDel,
            showItemsHomeAdd  : showItemsHomeAdd ,
            showItemsHomeDel  : showItemsHomeDel,
            showItemsHomeHead : showItemsHomeHead,
            stopPut           : stopPut,
            wechatPay         : wechatPay,
            getPurchaseUrl    : getPurchaseUrl
        };
        return service;
        function setShopcate(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreetaskserviceSetShopcateApi);
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

       function putAd(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskserviceputAdApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data);
                }
                return defer.promise;
            })
       }


       function showItemsDel(params) {
            var defer = $q.defer();
         var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskserviceShowItemsdelApi);
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

        function showItemsHomeAdd(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskserviceShowItemsHomeaddApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                     defer.resolve(response.data);
                }else{
                    defer.reject(response.data.error);
                }
                return defer.promise;
            })
        }

        function showItemsHomeDel(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskserviceShowItemsHomedelApi);
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

         function showItemsHomeHead(params) {
             var defer = $q.defer();
             var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskserviceShowItemsHomeHeadApi);
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

         function stopPut(params) {
             var defer = $q.defer();
             var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskserviceDelItemsApi);
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


        function wechatPay(params) {
             var defer = $q.defer();
             var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskservicewechatPayApi);
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

        function getPurchaseUrl(params) {
             var defer = $q.defer();
             var httpConfig = angular.copy(flowcarefreeTaskservice.apiConfig.flowcarefreeTaskservicegetPurchaseUrlApi);
             httpConfig.data = params ;
             return $http(httpConfig).then(function(response){
                console.log(response);
                 if(response.data.success == true){
                     defer.resolve(response.data);
                 }else{
                     defer.reject(response.data.error);
                 }
                 return defer.promise;
             })
        }
    }
})(window.angular);