(function(angular, undefined){'use strict';

    angular.module('myUserCenter.vouchercenter',[])
        .config(Configure)
        .controller('vouchercenterCtrl', vouchercenterCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.myuser.vouchercenter', {
                url: '/vouchercenter',
                parent: 'member.flowcarefree.myuser',
                templateUrl: '/template/flowcarefree/myUserCenter/voucherCenter.tpl.html',
                controller: 'vouchercenterCtrl',
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
    function vouchercenterCtrl($scope, $state, currentShop, flowcarefreegetservice, flowcarefreetask) {
        $scope.currentShop = currentShop;
        $scope.paySelect = paySelect;
        $scope.money = "(请选择你充值的类型)";
        $scope.showData = false;

        /**公用的请求数据格式转化**/
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



        /**请求支付接口**/
        flowcarefreegetservice.getsku().then(function(response){
            var payData = JSON.parse(response.data);
           $scope.payData = payData.content;
        })


        /**点击选择支付费用**/
        function paySelect(item) {
            console.log($scope.payData);
            console.log(item);
            console.log(item.name);
            $scope.showData = true;
            var money = item.name.split("值");
            var moneyArray = money[1].split("元");
            $scope.money = moneyArray[0];
            var newItem = {appKey:item.appKey,itemCode:item.itemCode,cycUnit:item.cycUnit,cycNum:item.cycNum};
            console.log(newItem);

            /**请求充值接口**/
            flowcarefreetask.getPurchaseUrl(newItem).then(function(response){
                console.log(response);
                var newData = JSON.parse(response.data);
                console.log(newData);
                if(response.success == true){
                    $scope.url = newData.content;
                }else {
                    layer.msg(response.error);
                }
           })
            $scope.numberId = item.id;
        }

    };
})(window.angular);