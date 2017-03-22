(function(angular, undefined){'use strict';

    angular.module('stock', [
        'autoAddGoods',
        'autoSyncGoods',
        'linkGoods',
    ])
        .config(Configure)
        .controller('stockMainCtrl', stockMainCtrl)
    ;

    /**
     * @ngInject
     */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.stock', {
                url: '/stock',
                views: {
                    "": {
                        template: '<ui-view></ui-view>',
                        controller: 'stockMainCtrl'
                    },
                    'menu': {
                        templateUrl: '/template/product/autoAdd/stockSubMenu.tpl.html'
                    }
                },
                parent: 'member.product'
            })
        ;
    }

    /**
     * @ngInject
     */
    function stockMainCtrl($state) {
        // console.log($state.get());
    }
})(window.angular);