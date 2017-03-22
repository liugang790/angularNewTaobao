(function(angular, undefined){'use strict';

    angular.module('flow', [
        'flowcarefreemisc',
        'deliveryadvertmisc',
        'myUserCenter'
    ])
        .config(Configure)
    ;

    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree', {
                url : '/flowcarefree',
                parent: 'member',
                views: {
                    "": {
                        template: '<ui-view></ui-view>'
                    },
                    'menu': {
                        template: '<div ui-view="menu"></div>'
                    }
                }
            });
    }
})(window.angular);