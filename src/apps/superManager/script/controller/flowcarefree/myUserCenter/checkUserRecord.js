(function(angular, undefined){'use strict';

    angular.module('myUserCenter.checkuserrecord',[])
        .config(Configure)
        .controller('checkuserrecordCtrl', checkuserrecordCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.myuser.checkuserrecord', {
                url: '/checkuserrecord',
                parent: 'member.flowcarefree.myuser',
                templateUrl: '/template/flowcarefree/myUserCenter/checkUserRecord.tpl.html',
                controller: 'checkuserrecordCtrl',
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
    function checkuserrecordCtrl($scope, $state, currentShop, listFactory, flowcarefreegetservice, systemMath) {
        $scope.currentShop = currentShop;






        /**请求用户消费记录接口**/
        flowcarefreegetservice.getPurchaseConsumeLog().then(function(response){
            if(response.success == true){
                var data = JSON.parse(response.data);
                $scope.data = data.content;
                angular.forEach($scope.data,function(item){
                    angular.extend(item,item,{
                        startTime:systemMath.toDateString(new Date(item.createTime),true)
                    })
                    angular.extend(item,item,{
                        fee:parseInt(item.fee/100)==item.fee/100?item.fee/100+'.00':item.fee/100
                    })     
                })
            }else{
                layer.msg(response.error);
            }
        })

        /**分页**/
        // function pagination(pageTotal){
        //     var pageNo = pageTotal % 20 == 0 ? parseInt(pageTotal / 20) : parseInt(pageTotal / 20) + 1;
        //     $('.goodsPage').pagination({
        //         pages: pageNo,
        //         styleClass: ['pagination-large'],
        //         showCtrl: true,
        //         displayPage: 6,
        //         onSelect: function (num) {
        //             listLoad(num);
        //         }
        //     })
        // }


    };
})(window.angular);