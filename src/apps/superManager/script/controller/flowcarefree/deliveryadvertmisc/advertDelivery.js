(function(angular, undefined){'use strict';

    angular.module('deliveryadvertmisc', [
        'deliveryadvertmisc.advert',
        'deliveryadvertmisc.myadvert',
        'deliveryadvertmisc.myadvertfaile'
    ])
        .config(Configure)
        .controller('flowcarefreeMainCtrl', flowcarefreeMainCtrl)
        ;

    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.advert', {
                url: '/advert',
                views: {
                    "": {
                        template: '<ui-view></ui-view>',
                        controller: 'flowcarefreeMainCtrl'
                    },
                    'menu': {
                        templateUrl: '/template/flowcarefree/deliveryadvertmisc/advertSubMenu.tpl.html'
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