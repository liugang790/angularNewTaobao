(function(angular,undefined){'use strict';

   angular.module('service.productcopy.list',[])
       .provider('productcopy',ProductcopyProvider);


   var productcopyProvider;
    function ProductcopyProvider() {
        productcopyProvider = this;
        this.$get = ProductcopyFactory;
        this.apiConfig = {
            productcopyaddApi:{
                 url:'http://super.7ingu.com/SuperManager/copy/goods',
                 method:'post',
                 cache: true,
                 headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }
        };
    }

   function  ProductcopyFactory($q, $http) {
      var service = {
        query : query
      };
      return service
     function query(params) {
        var defer = $q.defer();
        var httpConfig = angular.copy(productcopyProvider.apiConfig.productcopyaddApi);
        httpConfig.data = {'numiids': params.numiids};
        var gsellerOther,gsearchKey,pageNo;
        if(((!params.gsellerOther == null || !params.gsellerOther == "") || ((!params.gsearchKey == null || !params.gsearchKey == "") && (!params.gsellerOther == null || !params.gsellerOther == ""))) && (params.numiids == "" || params.numiids == null)){
               $.getShopItemList.process({ nick:params.gsellerOther, keyword:params.gsearchKey, pageNo:params.page,fn:function(totalNum, totalPage, array) {
                var item = array;
                defer.resolve({items: item, total:totalNum});
            }});
        }
        if((!params.gsellerOther  || !params.gsearchKey) && params.numiids){
           $http(httpConfig).then(function(response){   
            var item =response.data.data;
            item = JSON.parse(item);
            if(response.data.success == true){
                defer.resolve({items: item, total: item.length});
            }else {
                defer.reject({message:response.error});
            }
         })
        }
        return defer.promise;
      }
   } 
})(window.angular);