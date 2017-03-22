(function(angular, undefined){'use strict';

    angular.module('phoneDetail.developPhonedetail',['service.phoneDetail.operation'])
        .config(Configure)
        .controller('developPhonedetailCtrl', developPhonedetailCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.phone.developphonedetail', {
                url: '/developphonedetail',
                parent: 'member.product.phone',
                templateUrl: '/template/product/phoneDetail/developPhoneDetail.tpl.html',
                controller: 'developPhonedetailCtrl',
                resolve: {

                }
            });
    }

    /**
    * @ngInject
    */
    function developPhonedetailCtrl($scope, $state, listFactory, phoneOperation, appInfo) {
        $scope.viewDefault = true;
        $scope.listLoad             = listLoad;
        $scope.uploadWapDescTask    = uploadWapDescTask;
        $scope.selecteAll           = selecteAll;
        $scope.oneKeyWapDesc        = oneKeyWapDesc;
        $scope.viewHtml             = viewHtml;

        var time;

        $scope.list = listFactory.$new(phoneOperation.list);
        $scope.list.addLoadCallback(function (){
            var numiidListStr = [];
            angular.forEach($scope.list.items, function(item) {
                var j = {'numiid': item.numIid + ''};
                numiidListStr.push(j);
            });
            phoneOperation.hasPhoneDetailList({numiidListStr : angular.toJson(numiidListStr)}).then(function(result){
                console.log(result);
                var numiids = angular.fromJson(result.items);
                angular.forEach($scope.list.items, function(item) {
                    var status = '';
                    angular.forEach(numiids, function(numiid) {
                        if(numiid == item.numIid){
                            status = '1';
                            item.status = '1';
                        }
                    });
                    if(status == '') item.status = '2';
                });
            });
            pagination($scope.list.total);
        });
        $scope.list.load();

        function listLoad(pageNo) {
            if($scope.searchKey == undefined){
                $scope.list.filterOptions.searchKey = '';
            } else {
                $scope.list.filterOptions.searchKey = $scope.searchKey;
            }
            $scope.list.filterOptions.pageNo = pageNo;
            $scope.list.load();
        }
        function uploadWapDescTask() {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $.fn.walletinit({title:'当前版本不可使用此功能，如要使用，请升级到高级版，谢谢',subtitle:'仅需5元/月马上体验正式版！',btntitle:'立即打开红包',linkurl:'http://tb.cn/jcKqKTx',showtype:2});
                return;
            }
            var numiidListStr = [];
            angular.forEach($scope.list.items, function(item){
                if(item.selected == true){
                    var j = {'numiid': item.numIid + '', 'picUrl' : item.picUrl, 'title' : item.title};
                    item.status = 0;
                    numiidListStr.push(j);
                }
            });
            if(numiidListStr.length == 0){
                layer.msg("请选择需要生成手机详情的商品");
                return ;
            }
            function itemProcess(){
                phoneOperation.itemProcess({numiidListStr : angular.toJson(numiidListStr)}).then(function(response) {
                    var items = angular.fromJson(response.items);
                    var itemFinishArray = [];
                    angular.forEach(items, function(process){
                        if(process.status == '执行完成'){
                            itemFinishArray.push(process);
                            angular.forEach($scope.list.items, function(item){
                                if(item.numIid == process.numiid){
                                    item.status = 3;
                                }
                            });
                        } else if(process.status == '执行失败') {
                            itemFinishArray.push(process);
                            angular.forEach($scope.list.items, function(item){
                                if(item.numIid == process.numiid){
                                    item.status = 4;
                                }
                            });
                        } else if(process.status == '执行中'){
                            angular.forEach($scope.list.items, function(item){
                                if(item.numIid == process.numiid){
                                    item.status = 5;
                                }
                            });
                        }
                    });
                    if(itemFinishArray.length == items.length){
                        clearInterval(time);
                    }
                });
            }

            phoneOperation.uploadWapDescTask({jaStr : angular.toJson(numiidListStr)}).then(function(result){
                layer.msg('开始上传宝贝');
                itemProcess();
                time = setInterval(itemProcess,2000);
            });
        }

        function selecteAll(status) {
            $scope.selectedActivities = [];
            if(status) {
                angular.forEach($scope.list.items, function(item){
                    item.selected = true;
                    $scope.selectedActivities.push(item);
                });
            } else {
                angular.forEach($scope.list.items, function(item){
                    item.selected = false;
                });
            }
        }
        function oneKeyWapDesc(){
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $.fn.walletinit({title:'当前版本不可使用此功能，如要使用，请升级到高级版，谢谢',subtitle:'仅需5元/月马上体验正式版！',btntitle:'立即打开红包',linkurl:'http://tb.cn/jcKqKTx',showtype:2});
                return;
            }
            phoneOperation.oneKeyWapDesc().then(function(result){
                layer.alert('操作成功，系统将在后台为您生成手机详情，可以在生成记录中查看进度！', {
                    skin: 'layui-layer-molv',
                    closeBtn: 0,
                    shift: 2 //动画类型
                });
                console.log(result);
            });
        }

        function viewHtml(numiid){
            phoneOperation.viewHtml({numiid : numiid}).then(function(result){
                $scope.view = result.items;
                $scope.viewDefault = false;
            });
        }

        function pagination(pageTotal){
            var pageNo = pageTotal % 20 == 0 ? parseInt(pageTotal / 20) : parseInt(pageTotal / 20) + 1;
            $('.goodsPage').pagination({
                pages: pageNo,
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