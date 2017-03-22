(function(angular,undefined){'use strict';

  angular.module('service.productcopy.copyTask',[])
     .provider('productcopytask',ProductcopyTaskProvider);

     var productcopyTaskProvider;
     function ProductcopyTaskProvider() {
         productcopyTaskProvider = this;
         this.$get = productcopyTask;
         this.apiConfig = {
            productcopyTaskaddItemCopyApi:{
                url:'http://super.7ingu.com/SuperManager/copy/addItemCopy',
                method:'post',
                cache:true
            },
            productcopytaskdeliveryTemplatesApi:{
                url:'http://super.7ingu.com/SuperManager/copy/deliveryTemplates',
                method:'post',
                cache:true
            },
            productcopysellerCatsApi:{
                url:'http://super.7ingu.com/SuperManager/copy/sellerCats',
                method:'post',
                cache:true
            },
            productcopypictureCategoryApi:{
                url:'http://super.7ingu.com/SuperManager/copy/pictureCategory',
                method:'post',
                cache:true
            },
            productcopyitemProcessApi:{
                url:'http://super.7ingu.com/SuperManager/copy/itemProcess',
                method:'post',
                cache:true
            },
            productCopygetCatJsonApi:{
                url:'http://super.7ingu.com/SuperManager/copy/getCatJson',
                method:'post',
                cache:true
            },
            productcopylinkGoodsApi:{
                url:'http://super.7ingu.com/SuperManager/copy/linkGoods',
                method:'post',
                cache:true
            }
         };
     }
     function  productcopyTask($q, $http) {
        var service = {
            addItemCopy       : addItemCopy,
            deliveryTemplates : deliveryTemplates,
            sellerCats        : sellerCats,
            pictureCategory   : pictureCategory,
            itemProcess       : itemProcess,
            getCatJson        : getCatJson,
            linkGoods         : linkGoods
        };
        return service;
        function addItemCopy(params) {
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productcopyTaskaddItemCopyApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){  
                console.log(response.data); 
                defer.resolve(response.data);
                return defer.promise;
            })
       }
        function  deliveryTemplates(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productcopytaskdeliveryTemplatesApi);
            httpConfig.data = params ;
            return $http(httpConfig).then(function(response){   
                if(response.data.success == true){
                    defer.resolve(JSON.parse(response.data.data));
                }else {
                    defer.reject({message:response.error});
                }         
                return defer.promise;
            })
        }
        function  sellerCats(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productcopysellerCatsApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                    defer.resolve(JSON.parse(response.data.data));
                }else{
                    defer.reject({message:response.error});
                }
                return defer.promise;
            })
        }
        function pictureCategory(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productcopypictureCategoryApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                    defer.resolve(JSON.parse(response.data.data))
                }else{
                    defer.reject({message:response.error})
                }
                return defer.promise;
            })
        }
        function itemProcess(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productcopyitemProcessApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                console.log(response);
                if(response.data.success == true){
                    defer.resolve(response.data.data);
                }else{
                    defer.reject({message:response.error});
                }
                return defer.promise;
            })
        }
        function getCatJson(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productCopygetCatJsonApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                    defer.resolve(response.data.data);
                }else{
                    defer.reject({message:response.error});
                }
                return defer.promise;
            })
        }
        function linkGoods(params){
            var defer = $q.defer();
            var httpConfig = angular.copy(productcopyTaskProvider.apiConfig.productcopylinkGoodsApi);
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                if(response.data.success == true){
                    defer.resolve(response.data.data);
                }else {
                    defer.reject({message:response.error});
                }
                return defer.promise;
            })
        }
     }
})(window.angular);