(function(angular, undefined){'use strict';

    angular.module('productCopy.copybbAndJd',[])
        .config(Configure)
        .controller('copybbAndJdCtrl', copybbAndJdCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.copy.bbAndJdall', {
                url: '/bbAndJdall',
                parent: 'member.product.copy',
                templateUrl: '/template/product/productCopy/bbAndJd.tpl.html',
                controller: 'copybbAndJdCtrl',
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
    function copybbAndJdCtrl($scope, $state, currentShop) {
        $scope.currentShop = currentShop;
    };
})(window.angular);