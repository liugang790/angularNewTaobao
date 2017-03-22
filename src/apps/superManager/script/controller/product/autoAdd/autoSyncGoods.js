(function(angular, undefined){'use strict';

    angular.module('autoSyncGoods',['service.autoAdd.sync'])
        .config(Configure)
        .controller('autoSyncGoodsCtrl', autoSyncGoodsCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.stock.sync', {
                url: '/sync',
                parent: 'member.product.stock',
                templateUrl: '/template/product/autoAdd/autoSyncGoods.tpl.html',
                controller: 'autoSyncGoodsCtrl',
                resolve: {}
            });
    }

    /**
    * @ngInject
    */
    function autoSyncGoodsCtrl($scope, listFactory, autoSync, appInfo, $rootScope) {
        $scope.cancelSync       =   cancelSync;
        $scope.syncNow          =   syncNow;
        $scope.syncAllNow       =   syncAllNow;
        $scope.cancelSyncAll    =   cancelSyncAll;
        $scope.listLoad         =   listLoad;


        $scope.list = listFactory.$new(autoSync.hasLinkedList);
        $scope.list.addLoadCallback(function (){
            pagination($scope.list.total);
        });
        $scope.list.filterOptions.goodsName = "";
        $scope.list.filterOptions.pageSize = 10;
        $scope.list.filterOptions.pageNo = 1;
        $scope.list.load();

        // 列表加载
        function listLoad(pageNo) {
            $scope.list.filterOptions.goodsName = $scope.goodsName == undefined ? '' : $scope.goodsName;
            $scope.list.filterOptions.pageNo = pageNo;
            $scope.list.load();
        }

        // 分页
        function pagination(totalPage){
            $('.goodsPage').pagination({
                pages: totalPage,
                styleClass: ['pagination-large'],
                showCtrl: true,
                displayPage: 6,
                onSelect: function (num) {
                    listLoad(num);
                }
            })
        }

        function syncNow(item) {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                return;
            }
            var load = layer.load();
            autoSync.syncNow({numiid : item.numIid, linkNumiid : item.linkNumiid}).then(function(result){
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    if(result.success == true){
                        item.autoSync = 1;
                        item.syncDate = new Date();
                        layer.msg(result.data);
                    } else {
                        layer.msg(result.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function cancelSync(item) {
            var load = layer.load();
            autoSync.cancelSync({numiid : item.numIid}).then(function(result){
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    result = angular.fromJson(result.data);
                    if(result.success == true){
                        item.autoSync = 0;
                        layer.msg(result.data);
                    } else {
                        layer.msg(result.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function syncAllNow() {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                return;
            }
            var load = layer.load();
            autoSync.syncAllNow().then(function(result){
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    if(result.success == true){
                        layer.msg("操作成功");
                        listLoad(1);
                    } else {
                        layer.msg(result.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function cancelSyncAll() {
            var load = layer.load();
            autoSync.cancelSyncAll().then(function(result){
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    result = angular.fromJson(result.data);
                    if(result.success == true){
                        layer.msg(result.data);
                        listLoad(1);
                    } else {
                        layer.msg(result.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }
    }

})(window.angular);