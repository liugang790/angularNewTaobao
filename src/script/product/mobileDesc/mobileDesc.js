(function(angular, undefined) {'use strict';

/**
 * @ngdoc product.mobiledesc
 * @name product.mobiledesc
 * @description 手机详情功能模块
 */
angular
    .module('product.mobiledesc', [])
    .config(Configure)
    .constant('mobileDescListNs', 'mobileDesc')
    .provider('mobileDesc', MobileDescProvider)
    .controller('ProductListMobiledescCtrl', ProductListMobiledescCtrl)
    .controller('ProductListMobiledescItemCtrl', ProductListMobiledescItemCtrl)
;

var mobileDescProvider;
/**
 * @ngdoc config
 * @ngInject
 */
function Configure($routeProvider) {
    $routeProvider
        .when('/product/mobiledesc', {
            templateUrl: '/src/script/product/mobileDesc/list.tpl.html',
            controller: 'ProductListMobiledescCtrl'
        })
    ;
}

/**
 * @ngdoc provider
 * @ngInject
 */
function MobileDescProvider() {
    mobileDescProvider = this;
    this.$get = MobileDesc;

    this.createApiName = 'mobiledesc.create';
    this.onekeyApiName = 'mobiledesc.onekey';
}

/**
 * @ngdoc provider
 * @ngInject
 */
function MobileDesc(apiClient) {
    return {
        create: create,
        onekey: onekey,
    };

    function create(params) {
        if(angular.isUndefined(params)) {
            params = {}
        }
        return apiClient.$new(mobileDescProvider.createApiName).send(params);
    }    
    function onekey(params) {
        if(angular.isUndefined(params)) {
            params = {}
        }
        return apiClient.$new(mobileDescProvider.onekeyApiName).send(params);
    }
}

/**
* @ngdoc controller
* @description 手机详情控制器
* @ngInject
*/
function ProductListMobiledescCtrl($scope, $location, mobileDescListNs, productListManager, context, mobileDesc) {

    $scope.productList = productListManager.$get(mobileDescListNs);
    $scope.productList.pageSize = 20;
    $scope.listFilterData    = $scope.productList.filterOptions;
    $scope.productList.init(initCallback);
    $scope.isLoading = false;
    $scope.listActions = [
        {
            label        : '手机详情',
            icons        : 'fa fa-copy',
            class        : 'btn-primary',
        }
    ];
    $scope.onekey = onekey;

    function initCallback(list) {
        if(list.productSources.length > 1) {
            list.filterOptions.source = list.productSources[1];
        }
    }

    function onekey() {
        $scope.isLoading = true;
        var shopId = context.shopId();
        if(shopId) {
            mobileDesc.onekey({shopId: shopId}).then(function(response) {
                $location.path('/task/company/list')
            })
        }
    }
}

/**
* @ngdoc controller
* @ngInject
*/
function ProductListMobiledescItemCtrl($scope, $uibModal, $templateCache,mobileDesc, context) {
    $scope.createMobileDesc = createMobileDesc;
    $scope.preview = preview;
    $scope.creating = false;
    function createMobileDesc(product) {
        $scope.creating = true;
        var shopId = context.shopId();
        if(product.source.wareId && shopId) {
            mobileDesc.create({itemId: product.source.wareId, shopId: shopId}).then(function(response) {
                $scope.creating = false;
                product.otherInfo.mobileDesc = response.desc;
            })
        }
    }

    function preview(desc) {
        $templateCache.put('template/mobileDesc.tpl.html', 
            '<div class="modal-header"><button type="button" ng-click="$close()" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body">' + desc + '</div>'
        );
        var modal = $uibModal.open({
            animation: true,
            backdrop: true,
            size:"660",
            templateUrl: 'template/mobileDesc.tpl.html',
            scope: $scope
        });
    }
}

})(window.angular);
