(function(angular, undefined){'use strict';

    angular.module('autoAddGoods',['service.autoAdd.add'])
        .config(Configure)
        .controller('autoAddGoodsCtrl', autoAddGoodsCtrl);
    /**
     * @ngInject
     */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.stock.add', {
                url: '/goods',
                parent: 'member.product.stock',
                templateUrl: '/template/product/autoAdd/autoAddGoods.tpl.html',
                controller: 'autoAddGoodsCtrl',
                resolve: {}
            });
    }

    /**
     * @ngInject
     */
    function autoAddGoodsCtrl($scope, listFactory, autoAdd, appInfo, $rootScope) {

        $scope.saveSetting          = saveSetting;
        $scope.chooseWayClick       = chooseWayClick;
        $scope.addStockGoods        = addStockGoods;
        $scope.delStockGoods        = delStockGoods;
        $scope.selecteAll           = selecteAll;
        $scope.batchAddStockGoods   = batchAddStockGoods;
        $scope.listLoad             = listLoad;

        $scope.autoAddWayList = [
            {code: '1', name: '选中的补库存宝贝'},
            {code: '2', name: '所有出售中的宝贝'}
        ];
        $scope.code = '0';
        $scope.name = '选择自动补库存方式';
        $scope.soldOutAddCount = "";
        $scope.stockShortCount = "";
        $scope.stockShortAddCount = "";
        $scope.chooseWay = '0';

        autoAdd.getSetting().then(function(settingInfo){
            var setting = angular.fromJson(settingInfo.items);
            if(setting.data != null){
                $scope.soldOutAddCount = setting.data.soldOutAddCount == 'undefined' ? "" : setting.data.soldOutAddCount;
                $scope.stockShortCount = setting.data.stockShortCount == 'undefined' ? "" : setting.data.stockShortCount;
                $scope.stockShortAddCount = setting.data.stockShortAddCount == 'undefined' ? "" : setting.data.stockShortAddCount;
                $scope.chooseWay = setting.data.chooseWay;
                if(setting.data.autoAddWay == "1"){
                    $scope.name = "选中的补库存宝贝";
                    $scope.code = "1";
                } else if(setting.data.autoAddWay == "2") {
                    $scope.name = "所有出售中的宝贝";
                    $scope.code = "2";
                }
            }
            if($scope.chooseWay == "0"){
                $scope.closeAutoStock = true;
            } else if($scope.chooseWay == "1"){
                $scope.shortageAutoStock = true;
            } else if($scope.chooseWay == "2"){
                $scope.fewAutoStock = true;
            }
        });

        $scope.list = listFactory.$new(autoAdd.onSaleList);
        $scope.list.addLoadCallback(function(){
            pagination($scope.list.total);
        });
        $scope.list.filterOptions.addStatus = "";
        $scope.list.filterOptions.goodsName = "";
        $scope.list.filterOptions.pageSize = 10;
        $scope.list.filterOptions.pageNo = 1;
        $scope.list.load();

        function listLoad(pageNo) {
            $scope.list.filterOptions.pageNo = pageNo;
            $scope.list.load();
        }

        function saveSetting() {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                return;
            }
            if(!validate()) return ;
            autoAdd.saveSetting({
                soldOutAddCount: $scope.soldOutAddCount,
                stockShortCount: $scope.stockShortCount,
                stockShortAddCount : $scope.stockShortAddCount,
                chooseWay : $scope.chooseWay,
                autoAddWay : $scope.code}).then(function(result){
                console.log(result);
                result = angular.fromJson(result.items);
                if(result.success == true){
                    layer.msg(result.data);
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function chooseWayClick(code) {
            $scope.code = code;
            console.log(code);
        }

        function validate() {
            if($scope.chooseWay == '1'){
                if($scope.soldOutAddCount == ''){
                    layer.msg("自动增加库存数不能为空");
                    return false;
                } else if(!$.isNumeric($scope.soldOutAddCount)){
                    layer.msg("自动增加库存数格式错误，只能填写数字");
                    return false;
                } else if(!(parseInt($scope.soldOutAddCount) > 0 && parseInt($scope.soldOutAddCount) <= 100000)){
                    layer.msg("增加库存的数量范围是1~100000件");
                    return false;
                } else if($scope.code == 0){
                    layer.msg("请选择补库存方式");
                    return false;
                }
            } else if($scope.chooseWay == '2'){
                if($scope.stockShortCount == ''){
                    layer.msg("库存不足数不能为空");
                    return false;
                } else if(!$.isNumeric($scope.stockShortCount)){
                    layer.msg("库存不足数格式错误，只能填写数字");
                    return false;
                } else if(!(parseInt($scope.stockShortCount) > 0 && parseInt($scope.stockShortCount) <= 100000)){
                    layer.msg("库存不足N件，这个N的范围是1~100000件");
                    return false;
                } else if($scope.stockShortAddCount == ''){
                    layer.msg("自动增加数不能为空");
                    return false;
                } else if(!$.isNumeric($scope.stockShortAddCount)){
                    layer.msg("自动增加数格式错误，只能填写数字");
                    return false;
                } else if(!(parseInt($scope.stockShortAddCount) > 0 && parseInt($scope.stockShortAddCount) <= 100000)){
                    layer.msg("增加库存的数量范围是1~100000件");
                    return false;
                } else if($scope.code == 0){
                    layer.msg("请选择补库存方式");
                    return false;
                }
            }
            return true;
        }

        function addStockGoods(item) {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                return;
            }
            var numiidArry = new Array();
            numiidArry.push({
                "numiid": item.numIid + '',
                "picUrl": item.picUrl,
                "title": item.title
            });
            autoAdd.addStockGoods({itemsJa : angular.toJson(numiidArry)}).then(function(result){
                result = result.items;
                if(result.success == true){
                    var data = angular.fromJson(result.data);
                    if(data.success == true){
                        layer.msg(data.data);
                        item.isAdd = '1';
                    } else {
                        layer.msg(data.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function batchAddStockGoods() {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得5元红包','仅需5元/月马上体验正式版！','http://tb.cn/ac5IuZx');
                return;
            }
            var numiidArry = new Array();
            angular.forEach($scope.list.items, function(item){
                if(item.selected == true){
                    numiidArry.push({
                        "numiid": item.numIid + '',
                        "picUrl": item.picUrl,
                        "title": item.title
                    });
                }
            });
            autoAdd.addStockGoods({itemsJa : angular.toJson(numiidArry)}).then(function(result){
                result = result.items;
                if(result.success == true){
                    var data = angular.fromJson(result.data);
                    if(data.success == true){
                        layer.msg(data.data);
                        angular.forEach($scope.list.items, function(item){
                            if(item.selected == true){
                                item.isAdd = '1';
                            }
                        });
                    } else {
                        layer.msg(data.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function delStockGoods(item) {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                return;
            }
            var numiidArry = new Array();
            numiidArry.push({
                "numiid": item.numIid + '',
            });
            autoAdd.delStockGoods({numiids : angular.toJson(numiidArry)}).then(function(result){
                result = result.items;
                if(result.success == true){
                    layer.msg(result.data);
                    item.isAdd = '0';
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function selecteAll(status) {
            $scope.selectedActivities = [];
            if(status) {
                angular.forEach($scope.list.items, function(item){
                    if(item.isAdd == '0'){
                        item.selected = true;
                        $scope.selectedActivities.push(item);
                    }
                });
            } else {
                angular.forEach($scope.list.items, function(item){
                    item.selected = false;
                });
            }
        }

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
    }

})(window.angular);