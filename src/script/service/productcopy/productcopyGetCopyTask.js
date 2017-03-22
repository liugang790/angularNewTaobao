(function(angular,undefined){'use strict';
        angular.module('service.productcopy.getCopyTask',[])
                .provider("productcopyGetCopyTask",getCopyTaskProvider);   
        var getCopyTaskprovider;
        function  getCopyTaskProvider(){
            getCopyTaskprovider = this;
            this.$get = productcopyGetCopyTaskFactory;
            this.apiConfig = {
                productcopyGetCopyTaskApi:{
                    url:'http://super.7ingu.com/SuperManager/copy/getCopyTask',
                    method:'post',
                    cache:true
                }
            }
        }
        function productcopyGetCopyTaskFactory($q, $http){
            var service = {
                getCopyTask : getCopyTask
            }
            return service;
            function getCopyTask(params){
                var defer = $q.defer();
                var httpConfig = angular.copy(getCopyTaskprovider.apiConfig.productcopyGetCopyTaskApi);
                httpConfig.data = params;
                return $http(httpConfig).then(function(response){
                    console.log(JSON.parse(response.data.data));
                    var item = JSON.parse(response.data.data);
                    if(response.data.success == true){
                        defer.resolve({items: item, total: item.length});
                    }else{
                        defer.reject({message:response.error});
                    }
                    return defer.promise;
                })
            } 
        }
})(window.angular);