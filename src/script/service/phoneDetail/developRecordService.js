(function(angular,undefined){'use strict';

    angular.module('service.phoneDetail.record', [])
        .provider('phoneRecord', PhoneRecordProvider);


    var provider;
    function PhoneRecordProvider() {
        provider = this;

        this.$get = PhoneRecordFactory;

        this.apiConfig = {
            getWapDescTaskApi : {
                url:'http://super.7ingu.com/SuperManager/phone/getWapDescTask',
                method:'POST',
                cache: true
            },
            viewHtmlApi : {
                url:'http://super.7ingu.com/SuperManager/phone/viewHtml',
                method:'POST',
                cache: true
            }
        };
    }

    /**
     * @ngInject
     */
    function PhoneRecordFactory($q, $http) {
        var service = {
            list                : list,
            viewHtml            : viewHtml
        };
        return service;
        function list(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(provider.apiConfig.getWapDescTaskApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                var data =response.data.data;
                data = angular.fromJson(data);
                angular.forEach(data, function(item) {
                    item.picUrl = item.picUrl;
                });
                defer.resolve({items: data, total: data.length});
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
            });
        }

    }

})(window.angular);