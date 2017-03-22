(function(angular, undefined){'use strict';

angular
	.module('product.filter', [])
	.controller('multiShopFilterCtrl', multiShopFilterCtrl)
	.controller('taobaoFilterCtrl', taobaoFilterCtrl)
	.controller('jdFilterCtrl', jdFilterCtrl)
	.controller('suningFilterCtrl', suningFilterCtrl)
    .controller('weidianFilterCtrl', weidianFilterCtrl);

/**
* @ngInject
*/
function multiShopFilterCtrl($scope, productDatabaseManager) {
	productDatabaseManager.query().then(function(data){
		$scope.shopOptions = data;
	});
}

/**
* @ngInject
*/
function taobaoFilterCtrl($scope) {
	$scope.filterStatus = [
        {code: 'onsale',    name: '出售中'},
        {code: 'inventory', name: '仓库中'}
    ];
    if($scope.listFilterData.status === undefined){
        $scope.listFilterData.status = 'onsale';
    }
}

/**
* @ngInject
*/
function jdFilterCtrl($scope) {
    $scope.filterStatus = [
        {code: 'all',       name: '全部'},
        {code: 'onsale',    name: '出售中'},
        {code: 'inventory', name: '仓库中'}
    ];	

    $scope.orderField = [
        {code: 'offlineTime', name: '下架时间'},
        {code: 'onlineTime', name: '上架时间'},
        {code: 'stockNum', name: '库存'},
        {code: 'jdPrice', name: '京东价格'},
        {code: 'modified', name: '修改时间'}
    ];    
    $scope.orderType = [
        {code: 'desc', name: '倒序'},
        {code: 'asc', name: '正序'}
    ];

    if($scope.listFilterData.orderBy == undefined){
        $scope.listFilterData.orderBy = 'offlineTime';
    }

    if($scope.listFilterData.orderType == undefined){
        $scope.listFilterData.orderType = 'desc';
    }

    if($scope.listFilterData.status === undefined){
        $scope.listFilterData.status = 'all';
    }
}

/**
* @ngInject
*/
function suningFilterCtrl($scope) {
	$scope.filterStatus = [
        {code: 'all',       name: '全部'},
        {code: 'onsale',    name: '出售中'},
        {code: 'inventory', name: '仓库中'}
    ];
}

/**
* @ngInject
*/
function weidianFilterCtrl($scope) {
    $scope.filterStatus = [
        {code: 'onsale', name: '出售中'},
        {code: 'inventory', name: '已下架'}
    ];
    $scope.filterOrder = [
        {code: 1, name: '优先推荐'},
        {code: 2, name: '优先已售完'},
        {code: 3, name: '销量倒序'},
        {code: 4, name: '销量正序'},
        {code: 5, name: '库存倒序'},
        {code: 6, name: '库存正序'}
    ];
}

})(window.angular);