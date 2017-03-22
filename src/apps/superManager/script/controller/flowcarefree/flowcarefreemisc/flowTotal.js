(function(angular, undefined){'use strict';

    angular.module('flowcarefreemisc', [
        'flowcarefreemisc.mybaby',
        'flowcarefreemisc.deliverybaby',
        'flowcarefreemisc.deliveryurl'
    ])
        .config(Configure)
        .controller('flowcarefreeMainCtrl', flowcarefreeMainCtrl)
        ;

    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.goods', {
                url: '/goods',
                views: {
                    "": {
                        template: '<ui-view></ui-view>',
                        controller: 'flowcarefreeMainCtrl'
                    },
                    'menu': {
                        templateUrl: '/template/flowcarefree/flowcarefreemisc/flowSubMenu.tpl.html'
                    }
                },
                parent: 'member.flowcarefree'
            })
            ;
    }
    /**
    * @ngInject
    */
    function flowcarefreeMainCtrl($state) {
        // console.log($state.get());
    }
})(window.angular);