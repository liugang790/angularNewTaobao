(function(angular, undefined){'use strict';

    angular.module('flowcarefreemisc.deliveryurl',[])
        .config(Configure)
        .controller('deliveryurlCtrl', deliveryurlCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.goods.deliveryurl', {
                url: '/deliveryurl',
                parent: 'member.flowcarefree.goods',
                templateUrl: '/template/flowcarefree/flowcarefreemisc/deliveryUrl.tpl.html',
                controller: 'deliveryurlCtrl',
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
    function deliveryurlCtrl($scope, $state, currentShop, listFactory, flowcarefreegetservice) {
        $scope.currentShop = currentShop;
        $scope.listLoad = listLoad;
        $scope.list = listFactory.$new(flowcarefreegetservice.showUrl);
        $scope.list.load();
        $scope.list.addLoadCallback(categoryList);




        /**获取list列表数据**/
        function categoryList() {
            $scope.lists = $scope.list.items;
            $('.goodsPage').pagination({
                pages: $scope.list.total,
                styleClass: ['pagination-large'],
                showCtrl: true,
                displayPage: 6,
                onSelect: function (num) {
                    listLoad(num);
                }
            })
        }


        /**搜索**/
        function listLoad(pageNo) {
                $scope.list.filterOptions.pageNo = pageNo;
                $scope.list.load();
            } 

    };
})(window.angular);