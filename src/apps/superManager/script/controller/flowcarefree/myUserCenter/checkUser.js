(function(angular, undefined){'use strict';

    angular.module('myUserCenter.checkuser',[])
        .config(Configure)
        .controller('checkuserCtrl', checkuserCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.myuser.checkuser', {
                url: '/checkuser',
                parent: 'member.flowcarefree.myuser',
                templateUrl: '/template/flowcarefree/myUserCenter/checkUser.tpl.html',
                controller: 'checkuserCtrl',
                resolve: {
                    currentShop: /* @ngInject */function(Context){
                        return null;
                        //return Context.shop();
                    }
                }
            });
    }

    /**
    * @ngInject
    */
    function checkuserCtrl($scope, $state, currentShop, listFactory, flowcarefreegetservice) {
        $scope.currentShop = currentShop;



        /**请求支付接口**/
        flowcarefreegetservice.getPurchaseFee().then(function(response){
            if(response.success == true){
                var data = JSON.parse(response.data);
                var userName = data.content.sellerNick.split("_");
                $scope.name = userName[1];
                $scope.price = data.content.totalFee/100; 
            }else{
                layer.msg(response.error);
            }
        })

        
    };
})(window.angular);