(function(angular,undefined){'use strict';

    angular.module('service.phoneDetail.operation', [])
        .provider('phoneOperation', PhoneOperationProvider);


    var provider;
    function PhoneOperationProvider() {
        provider = this;

        this.$get = PhoneOperationFactory;

        this.apiConfig = {
            listApi : {
                url:'http://super.7ingu.com/SuperManager/phone/onsaleList',
                method:'POST',
                cache: true
            },
            hasDetailPhoneList : {
                url:'http://super.7ingu.com/SuperManager/phone/hasPhoneDetail',
                method:'POST',
                cache: true
            },
            uploadWapDescTask : {
                url:'http://super.7ingu.com/SuperManager/phone/uploadWapDescTask',
                    method:'POST',
                    cache: true
            },
            oneKeyWapDesc : {
            url:'http://super.7ingu.com/SuperManager/phone/oneKeyWapDesc',
                method:'POST',
                cache: true
            },
            viewHtmlApi : {
                url:'http://super.7ingu.com/SuperManager/phone/viewHtml',
                method:'POST',
                cache: true
            },
            itemProcess : {
                url:'http://super.7ingu.com/SuperManager/phone/getWapDescProgress',
                method:'POST',
                cache: true
            }
        };
    }

    /**
     * @ngInject
     */
    function PhoneOperationFactory($q, $http) {
        var service = {
            list                : list,
            hasPhoneDetailList  : hasPhoneDetailList,
            uploadWapDescTask   : uploadWapDescTask,
            oneKeyWapDesc       : oneKeyWapDesc,
            viewHtml            : viewHtml,
            itemProcess         : itemProcess
        };

        return service;
        function list(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.listApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var data =response.data.data;
                angular.forEach(data.list, function(item) {
                    item.status = '0'; // 正在检测
                    item.selected = false; // 默认未选中
                    item.picUrl = item.picUrl + '_50x50.jpg_.webp';
                });
                defer.resolve({items: data.list, total: data.total});
                return defer.promise;
            })
        }

        function hasPhoneDetailList(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.hasDetailPhoneList);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }

        function uploadWapDescTask(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.uploadWapDescTask);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }

        function oneKeyWapDesc(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.oneKeyWapDesc);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }

        function viewHtml(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.viewHtmlApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }

        function itemProcess(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.itemProcess);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var item =response.data.data;
                defer.resolve({items: item});
                return defer.promise;
            })
        }
    }

})(window.angular);