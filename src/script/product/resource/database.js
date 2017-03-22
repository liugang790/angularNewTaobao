(function(angular, undefined) {
    'use strict';

    /**
     * @ngdoc module
     * @name product.database
     * @description 提供商品数据来源数据库的相关功能
     */
    angular
        .module('product.resource.source', ['shop'])
        /**
         * @method query() []ProductDatabase    查询系统中所有的商品来源类型
         */
        .provider('productDatabaseManager', ProductDatabaseManagerProvider);

    /**
     * 商品数据库provider对象实例
     */
    var productDatabaseManagerProvider;

    /**
     * @ngdoc entity
     * @name ProductDatabase
     * @description 封装店铺数据来源数据库对象
     */
    function ProductDatabase(datas) {
        this.typeCode = 'shop';
        this.value = '';
        this.name = '';
        this.filterTemplateUrl = '';

        angular.extend(this, datas);
    }

    /**
     * @ngdoc product
     * @name productDatabaseManagerProvider
     */
    function ProductDatabaseManagerProvider() {
        productDatabaseManagerProvider = this;
        this.getPlatformFilterTemplateUrl = getPlatformFilterTemplateUrl;
        this.$get = ProductDatabaseManager;

        this.databases = [
            // 全店商品库数据库
            new ProductDatabase({
                typeCode: 'database',
                value: 'multiShopProudct',
                name: '全店商品库',
                filterTemplateUrl: '/src/script/product/productList/filterTpl/multiShopProduct.filter.tpl.html'
            })
        ];

        // 存储各平台店铺商品查询条件模板路径
        this.platformFilterTemplateUrls = {
            taobao: '/src/script/product/productList/filterTpl/taobao.filter.tpl.html',
            jd:     '/src/script/product/productList/filterTpl/jd.filter.tpl.html',
            suning: '/src/script/product/productList/filterTpl/suning.filter.tpl.html',
            weidian:'/src/script/product/productList/filterTpl/weidian.filter.tpl.html',
            youzan: '/src/script/product/productList/filterTpl/youzan.filter.tpl.html'
        };

        /**
         * 返回指定第三方电商平台店铺商品查询条件模板路径
         * @param  {string} platformCode 第三方平台代码
         * @return {string}              查询条件模板路径
         */
        function getPlatformFilterTemplateUrl(platformCode) {
            if (angular.isUndefined(this.platformFilterTemplateUrls[platformCode])) {
                return '';
            }
            return this.platformFilterTemplateUrls[platformCode];
        }
    }

    /**
     * @ngdoc service
     * @ngInject
     * @name productDatabaseManager
     */
    function ProductDatabaseManager(Shop) {
        var databaseManager = {
            query: queryDatabaseManager
        };
        return databaseManager;

        /**
         * 返回系统中所有的商品数据来源数据库
         */
        function queryDatabaseManager() {
            var dbmProvider = productDatabaseManagerProvider;
            return Shop.query().then(function(response) {
                var databases = angular.copy(productDatabaseManagerProvider.databases);
                angular.forEach(response.items, function(shop) {
                    // 将shop实体转换成ProductDatabase对象实例
                    databases.push(new ProductDatabase({
                        typeCode: 'shop',
                        value: shop.id,
                        name: shop.displayName,
                        platformCode: shop.app.platformCode,
                        filterTemplateUrl: dbmProvider.getPlatformFilterTemplateUrl(
                            shop.app.platformCode)
                    }));
                });
                return databases;
            });
        }
    }

})(window.angular);
