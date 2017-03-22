(function(angular, undefined){'use strict';

    angular.module('myUserCenter.addrecord',[])
        .config(Configure)
        .controller('addrecordCtrl', addrecordCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.myuser.addrecord', {
                url: '/addrecord',
                parent: 'member.flowcarefree.myuser',
                templateUrl: '/template/flowcarefree/myUserCenter/addRecord.tpl.html',
                controller: 'addrecordCtrl',
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
    function addrecordCtrl($scope, $state, currentShop, listFactory, flowcarefreegetservice, systemMath) {
        $scope.currentShop = currentShop;




        /**请求支付接口**/
        flowcarefreegetservice.getPurchaseLog().then(function(response){
            if(response.success == true){
                var data = JSON.parse(response.data);
                $scope.data = data.content;
                angular.forEach($scope.data,function(item){
                    angular.extend(item,item,{
                        startTime:systemMath.toDateString(new Date(item.createTime),true)
                    })
                    angular.extend(item,item,{
                        totalFee:item.totalFee/100
                    })   
                })
            }else{
                layer.msg(response.error);
            }
           
        })


        
    };
})(window.angular);