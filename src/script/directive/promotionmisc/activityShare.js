(function(angular, undefined) {'use strict';

    /**
     *活动分享指令
     */
    angular
        .module('directives.sharePop', [])
        .directive('sharePop', sharePopDirective)
        .controller('sharePopCtrl', sharePopCtrl)
    ;

    /**
     * ispop: 是否弹框
     * plat : 显示那个分享平台
     * prev : 是否需要预览
     */
    function sharePopDirective(){
         return {
            restrict: 'E',
            replace: true,
            templateUrl: '',
            controller: 'sharePopCtrl',
            transclude : true,
            scope: {
                share: '=',
                activity: '='
            }
        };
    }

    function sharePopCtrl($scope, $compile, $rootScope, appInfo, ActivityProduct, product, systemMath, Activity, appConfig, $timeout, ActivityPage, StorageFactory) {
        var previewModalInstance; //弹出层handle
        var  linkPopout; //购买弹框层
        $scope.isSubscribeDisable = false; //是否为试用版用户

        $scope.closePreview = closePreview;
        $scope.editWeiXin = editWeiXin;
        $scope.backEdit = backEdit;
        $scope.inPlats = inPlats;
        $scope.toPreviewTabYl = toPreviewTabYl;
        $scope.toPreviewTabWt = toPreviewTabWt;
        $scope.toPreviewTabWx = toPreviewTabWx;
        $scope.closeShare = closeShare;
        $scope.$watch(function(){return $scope.share.ispop;}, function(newValue, oldValue){
            if(newValue !== oldValue && newValue === true){
                if($scope.activity.id !== undefined){ //针对活动列表
                    init($scope.activity);
                    userRole();
                    showtabs($scope.share.tabs);
                    openModal('/template/promotion/sharePop.tpl.html');
                }
            }
        });

        function init(data){
            $scope.share.active = [false, false, false];
            $scope.weitao = {
                loadImage : true,
                publish : true,
                notify : '',
                title : data.detail.priceTag + '：多买多优惠，限量疯抢中！',
                images : [],
                share : shareToWeitao,
                sharing : false,
                qrcode : appConfig.activityUrl + '/activity/' + data.id + '/weitao',
                errorMessage: ''
            };
            $scope.weixin ={
                step : {
                    one : true,
                    two : false,
                    oneTitle : true,
                    onePageSetting : false,
                    errorTitle : '未知错误'
                },
                sharing : false,
                qrcode : appConfig.activityUrl + '/share.php/activity/' + data.id + '/weixin'
            }
        }


        function userRole(){
            if(appInfo.has('deadline')) {
                $scope.deadline = appInfo.get('deadline').deadlineDay;
                $scope.subscribeVer = appInfo.get('deadline').itemCode;
                if($scope.subscribeVer === 'vip0') {
                    $timeout(function(){
                        $rootScope.popBuyLink('恭喜您获得一个红包', '试用版功能限制, 为了更好体验, 请立即升级', 'http://tb.cn/6lGQlQx');
                    }, 1500);
                }
                if($scope.deadline <= 3 && $scope.subscribeVer !== 'vip0') {
                    $timeout(function(){
                        $rootScope.popBuyLink('恭喜您获得一个红包', '订购即将到期, 为了不影响使用, 请立即升级', 'http://tb.cn/jcKqKTx');
                    }, 1500);
                }
            }
        }

        function closePreview(){
            $scope.share.ispop = false;
            $scope.weixin = {
                step : {
                    one : true,
                    two : false,
                    oneTitle : true,
                    onePageSetting : false,
                    errorTitle : '未知错误'
                }
            }
        }

        function showtabs(tabs){
            for(var tab in tabs){
                if('weitao' === tabs[tab]){
                    $scope.platName = '微淘';
                    $scope.share.active[0] = true;
                    $scope.tabActive = 'weitao';
                    $scope.share.qrcode = $scope.weitao.qrcode;
                    weiTaoGetImages();
                }
                if('weixin' === tabs[tab]){
                    $scope.platName = '微信';
                    $scope.share.active[1] = true;
                    $scope.tabActive = 'weixin';
                    $scope.share.qrcode = $scope.weixin.qrcode;
                }
            }
        }

        /**
         * 判断是否在
         */
        function inPlats(plat){
            var tabs = $scope.share.tabs;
            for (var i in tabs){
                if(tabs[i] == plat){
                    return true; 
                }
            }
            return false;
        }
        function toPreviewTabYl(){
            $scope.share.active[2] = true;
            $scope.share.active[0] = false;
            $scope.share.active[1] = false;
            $scope.tabActive = 'preview';
        }

        function toPreviewTabWx(){
            $scope.share.active[2] = false;
            $scope.share.active[0] = false;
            $scope.share.active[1] = true;
            $scope.tabActive = 'preview';
        }

        function toPreviewTabWt(){
            $scope.share.active[2] = false;
            $scope.share.active[0] = true;
            $scope.share.active[1] = false;
            $scope.tabActive = 'preview';
        }
        function weiTaoGetImages(){
            //重复点击 清空
            $scope.weitao.images = [];
            $scope.weitao.loadImage = true;
            $scope.weitao.notify ='';
            //获取图片
            ActivityProduct.getAdded({id: $scope.activity.id}).then(function(data){
                var activityItems = data.items;
                if(data.total >= 3){
                    angular.forEach(activityItems, function(item, key){
                        if(key <= 2){
                            $scope.weitao.images.push(item.picUrl);
                        }
                    });
                    $scope.weitao.loadImage = false;
                }
                if(data.total <= 2 && data.total > 0){
                    angular.forEach(activityItems, function(aitem){
                        product.get({id: aitem.itemId, shopId: $scope.activity.shop.id}).then(function(productData){
                            if(productData.images.length >0){
                                angular.forEach(productData.images, function(img){
                                    $scope.weitao.images.push(img);
                                });
                            }
                            if($scope.weitao.images.length < 3){
                                $scope.weitao.notify = '微淘分享图片至少为三张，请再添加其他活动商品！';
                            }else {
                                $scope.weitao.notify = false;
                                $scope.weitao.images = $scope.weitao.images.slice(0, 3);
                            }
                            $scope.weitao.loadImage = false;
                        });
                    });
                }
                if(data.total === 0){
                    $scope.weitao.loadImage = false;
                    $scope.weitao.notify = '当前活动还未添加活动商品！快去添加商品吧！';
                }
            });
        }

        /**
         * 分享到微淘
         */
        function shareToWeitao() {
            $scope.weitao.sharing = true;
            var sharContent = {
                id : $scope.activity.id,
                title : $scope.weitao.title, 
                shareMethod: 'weitao',
                images : $scope.weitao.images,
                activityPage : $scope.weitao.qrcode,
                summary: $scope.weitao.title
            };
            Activity.shareActivity(sharContent).then(function(data){
                $scope.shareTimeStorage = StorageFactory.$new('sharetime');
                $scope.shareTimeStorage.put('weitao', new Date());
                $scope.weitao.sharing = false;
                closePreview();
            },function(error){
                $scope.weitao.sharing = false;
                $scope.weitao.errorMessage = error.errorMessage;
            });
        }

        /**
         *编辑分享活动页面
         */
        function editWeiXin(activity){
            $scope.weixin.sharing = true;
            var params = activity.page;
            params.activityId = activity.id;
            ActivityPage.editPage(params).then(function (data) {
                $scope.weixin.step.one = false;
                $scope.weixin.step.two = true;
                $scope.weixin.sharing = false;
                $scope.refresh++;
            },function (error) {
                $scope.weixin.errorTitle = '提交失败,请重新提交';
            });
        }

        function backEdit() {
            //微信分享返回上一步
            $scope.weixin.step ={
                one : true,
                oneTitle : true,
                onePageSetting : false,
                two : false
            }
        }

        function openModal(tplDir) {
            var html = '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                + '<div ng-include="\''+ tplDir + '\'"></div>'+'</div>';
            var modalElement = angular.element(html);
            $('.page-body').after(modalElement);
            $compile(modalElement)($scope);
            $(modalElement).modal({backdrop: 'static'});
        }

        function closeShare() {
            $scope.share.ispop = false;
        }
    }
    
})(window.angular);