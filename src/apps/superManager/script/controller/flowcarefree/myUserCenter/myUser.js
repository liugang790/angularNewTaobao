(function(angular, undefined){'use strict';

    angular.module('myUserCenter', [
        'myUserCenter.vouchercenter',
        'myUserCenter.checkuser',
        'myUserCenter.checkuserrecord',
        'myUserCenter.addrecord'
    ])
        .config(Configure)
        .controller('flowcarefreeMainCtrl', flowcarefreeMainCtrl)
        ;

    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.myuser', {
                url: '/myuser',
                views: {
                    "": {
                        template: '<ui-view></ui-view>',
                        controller: 'flowcarefreeMainCtrl'
                    },
                    'menu': {
                        templateUrl: '/template/flowcarefree/myUserCenter/userSubMenu.tpl.html'
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