(function(angular, undefined){'use strict';

    angular.module('phoneDetail', [
        'phoneDetail.developPhonedetail',
        'phoneDetail.developRecord',
    ])
    .config(Configure)
    .controller('phoneDetailMainCtrl', phoneDetailMainCtrl)
    ;

    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.phone', {
                url: '/phone',
                views: {
                    "": {
                        template: '<ui-view></ui-view>',
                        controller: 'phoneDetailMainCtrl'
                    },
                    'menu': {
                        templateUrl: '/template/product/phoneDetail/phonesubMenu.tpl.html'
                    }
                },
                parent: 'member.product'
            })
        ;
    }

    /**
    * @ngInject
    */
    function phoneDetailMainCtrl($state) {
        // console.log($state.get());
    }
})(window.angular);