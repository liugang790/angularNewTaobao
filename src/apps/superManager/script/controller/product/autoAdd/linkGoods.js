(function(angular, undefined){'use strict';

    angular.module('linkGoods',['service.autoAdd.link'])
        .config(Configure)
        .controller('linkGoodsCtrl', linkGoodsCtrl);
    /**
     * @ngInject
     */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.stock.link', {
                url: '/link',
                parent: 'member.product.stock',
                templateUrl: '/template/product/autoAdd/linkGoods.tpl.html',
                controller: 'linkGoodsCtrl',
                resolve: {}
            });
    }

    /**
     * @ngInject
     */
    function linkGoodsCtrl($scope, listFactory, link, appInfo, $rootScope) {
        $scope.listLoad             = listLoad;
        $scope.linkInfoShowOrHidden = linkInfoShowOrHidden;
        $scope.modify               = modify;
        $scope.changeUrl            = changeUrl;
        $scope.saveSkus             = saveSkus;
        $scope.delLinkGoods         = delLinkGoods;
        $scope.chooseSku            = chooseSku;
        $scope.chooseStatusClick    = chooseStatusClick;
        $scope.skuInfo, $scope.status =  '1';

        $scope.goodsStatus = [
            {code: '1', name: '出售中的宝贝'},
            {code: '0', name: '仓库中的宝贝'}
        ];
        $scope.name = '出售中的宝贝';
        $scope.code = '1';

        $scope.list = listFactory.$new(link.goodsList);
        $scope.list.addLoadCallback(function (){
            pagination($scope.list.total);
        });
        $scope.list.filterOptions.saleStatus = "";
        $scope.list.filterOptions.linkStatus = "";
        $scope.list.filterOptions.goodsName = "";
        $scope.list.filterOptions.pageSize = 10;
        $scope.list.filterOptions.pageNo = 1;
        $scope.list.load();

        // 列表加载
        function listLoad(pageNo) {
            $scope.list.filterOptions.saleStatus = $scope.code == undefined ? "" : $scope.code;
            $scope.list.filterOptions.linkStatus = "";
            $scope.list.filterOptions.goodsName = $scope.goodsName == undefined ? "" : $scope.goodsName;
            $scope.list.filterOptions.pageSize = 10;
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

        // 隐藏或显示关联信息
        function linkInfoShowOrHidden(item) {
            if(item.isShow == true) {
                item.isShow = false;
            } else {
                angular.forEach($scope.list.items, function(item) {
                    item.isShow = false; // 默认未选中
                });
                item.isShow = true;
                skusList(item);
            }
        }

        // 获取商品Sku信息
        function skusList(item) {
            var load = layer.load();
            $scope.skuInfo = null;
            link.skusList({numiid : item.numIid}).then(function(result){
                console.log(result);
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    angular.forEach(result.data.properties, function (property) {
                        property.skusLength = Object.keys(property.linkSkus).length;
                    });
                    $scope.skuInfo = result.data;
                } else {
                    layer.msg(result.error);
                }
            });
        }

        // 监控linkUrl输入框变化
        function changeUrl(item){
            var url = item.linkUrl;
            var id = getUrlParam(url, "id");
            if(id != ""){
                linkSkus(item.numIid, id);
            } else {
                layer.msg("格式错误");
            }
        }

        // 获取url中的参数
        function getUrlParam(url, paras){
            if(url.indexOf("?") == -1) return "";
            var paraString = url.split("?");
            if(paraString.length != 2) return "";
            paraString = paraString[1].split("&");
            var returnValue = '';
            for (var i = 0; i < paraString.length; i++) {
                if(paraString[i].indexOf(paras) != -1){
                    returnValue = paraString[i].split("=")[1];
                }
            }
            if (returnValue == '') return "";
            else return returnValue;
        }

        // 获取关联商品Sku信息
        function linkSkus(numiid, linkNumiid) {
            var load = layer.load();
            if(numiid == linkNumiid) {
                layer.msg("不能关联相同的宝贝");
                layer.close(load);
            }else {
                link.linkSkus({numiid : numiid, linkNumiid : linkNumiid}).then(function(result){
                layer.close(load);
                result = result.items;
                $scope.skuInfo = {};
                if(result.success == true){
                    result = angular.fromJson(result.data);
                    if(result.success == true){
                        $scope.skuInfo = result.data;
                    } else {
                        layer.msg(result.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
            }
            
        }

        // 下拉选择Sku
        function chooseSku(property, key, value){
            var m = {};
            console.log(property);
            angular.forEach(Object.keys(property.linkSkus), function (k) {
                var indexKey = key.split(":")[0];
                if(k.indexOf(indexKey) != -1 && k != key){
                    m[key] = value;
                } else {
                    m[k] = property.linkSkus[k];
                }
                delete(property.linkSkus[k]);
            });
            property.linkSkus = m;
        }

        // 保存商品Sku关联信息
        function saveSkus(item, skusInfo) {
            $scope.subscribeVer = appInfo.get('deadline').itemCode;
            if($scope.subscribeVer != 'vip2'){
                // 弹窗提示
                $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                return;
            }

            var properties = '';
            angular.forEach(skusInfo.properties, function(property) {
                angular.forEach(Object.keys(property.linkSkus), function(linkSkuKey) {
                    properties += property.id + "_" + property.linkNumiid + "_" + linkSkuKey + ":" + property.linkSkus[linkSkuKey] + "&";
                });
            });
            var load = layer.load();
            link.saveSkus({
                properties : properties,
                numiid : item.numIid,
                linkNumiid : skusInfo.linkNumiid,
                goodsName : item.title,
                linkGoodsName : skusInfo.linkGoods.title,
                picUrl : item.picUrl,
                linkPicUrl : skusInfo.linkGoods.picUrl
            }).then(function(result){
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    layer.msg(result.data);
                    item.linkPicUrl = skusInfo.linkGoods.picUrl + '_50x50.jpg_.webp';
                    item.linkNumiid = skusInfo.linkNumiid;
                    item.linkGoodsName = skusInfo.linkGoods.title;
                    item.modify = false;
                } else {
                    layer.msg(result.error);
                }
            });
        }

        // 修改按钮
        function modify(item){
            item.modify = item.modify == true ? false : true;
        }

        // 修改商品Sku关联信息


        // 删除关联商品
        function delLinkGoods(item){
            var load = layer.load();
            link.delLinkGoods({numiid : item.numIid}).then(function(result){
                layer.close(load);
                result = result.items;
                if(result.success == true){
                    result = angular.fromJson(result.data);
                    if(result.success){
                        layer.msg(result.data);
                        item.linkNumiid = undefined;
                        item.linkPicUrl = undefined;
                        item.linkUrl = undefined;
                    } else {
                        layer.msg(result.error);
                    }
                } else {
                    layer.msg(result.error);
                }
            });
        }

        function chooseStatusClick(code) {
            $scope.code = code;
        }
    }

})(window.angular);