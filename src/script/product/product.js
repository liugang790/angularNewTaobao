(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name shop
 * @description 提供与店铺管理相关的功能
 */
angular
    .module('product', [
        'product.resource',
        'product.list',
        'product.multiShopProduct',
        'product.sync',
        'product.copy',
        'product.desc'
    ])
;

})(window.angular);
