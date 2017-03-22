(function(angular, undefined){'use strict';

    angular.module('deliveryadvertmisc.advert',[])
        .config(Configure)
        .controller('advertCtrl', advertCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.advert.advert', {
                url: '/advert',
                parent: 'member.flowcarefree.advert',
                templateUrl: '/template/flowcarefree/deliveryadvertmisc/deliveryAdvert.tpl.html',
                controller: 'advertCtrl',
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
    function advertCtrl($scope, $sce, $state, currentShop, listFactory, flowcarefreegetservice, $compile, flowcarefreetask, $element) {
        $scope.currentShop = currentShop;
        $scope.categoryList = categoryList;
        $scope.categoryListOnsale = categoryListOnsale;
        $scope.listLoad = listLoad;
        $scope.listLoadOnsale = listLoadOnsale;
        $scope.searchGoods = searchGoods;
        $scope.searchGoodsOnsale = searchGoodsOnsale;
        $scope.deliveryAdvert = deliveryAdvert;
        $scope.deliveryModal = deliveryModal;
        $scope.accountModal = accountModal;
        $scope.ewmModal = ewmModal;
        $scope.preview = preview;
        $scope.pictureWatch = pictureWatch;
        $scope.Select = Select;
        $scope.setDay = setDay;
        $scope.deliverySure = deliverySure;
        $scope.priceDownChange = priceDownChange;
        $scope.priceUpChange = priceUpChange;
        $scope.readCountAdd = readCountAdd;
        $scope.readCountLese = readCountLese;
        $scope.checkAlldelivery = checkAlldelivery;
        $scope.checkNodelivery = checkNodelivery;
        $scope.dataPut = false;
        $scope.list = listFactory.$new(flowcarefreegetservice.wechatList);
        $scope.listGoods = listFactory.$new(flowcarefreegetservice.OnsaleList);
        $scope.list.filterOptions.pageStatus = 1;
        $scope.list.load();
        $scope.listGoods.load();
        $scope.list.addLoadCallback(categoryList);
        $scope.listGoods.addLoadCallback(categoryListOnsale);


        /**公用的请求数据格式转化**/
        function serialize(obj, prefix) {
            var str = [], p;
            for(p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push((v !== null && typeof v === "object") ?
                        serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
            console.log(str);
            return str.join("&");  
        }


        /**投放广告商品弹框**/
        function deliveryModal() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/deliveryadvertmisc/deliveryModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }

        /**余额不足弹框提示**/
        function accountModal() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/deliveryadvertmisc/accountModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }

        /**二维码查看**/
        function ewmModal(item) {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/deliveryadvertmisc/ewmModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
            $scope.qrcodeUrl = item.url?item.url:item.page_url;
        }


         /**点击预览**/
         $scope.showItem = false;
         function preview(item,number) {
            $scope.number = number;
            $scope.showItem = true;
            $scope.itemUrl = item.url;
            $scope.trustSrc = function(src) {
                return $sce.trustAsResourceUrl(src);
            }
            $scope.movie = item.url;
            }

         /**点击图片或者标题预览**/
         function pictureWatch(item,number) {
            console.log(item);
            $scope.number = number;
            $scope.showItem = true;
                $scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                }
                $scope.movie = item.url?item.url:item.page_url;
         }



        /**投放广告**/
        function deliveryAdvert(item) {
            pagination($scope.listGoods.total);
            /**分页**/
            function pagination(total){
                $('.goodsPagea').pagination({
                    itemsCount: total,
                    styleClass: ['pagination-large'],
                    showCtrl: true,
                    displayPage: 6,
                    onSelect: function (num) {
                        listLoadOnsale(num);
                    }
                })
                $('.goodsPagea').pagination('updateItemsCount',$scope.listGoods.total);
            }   
            sessionStorage.item = JSON.stringify(item);
            if(item.payDay == "" || item.payDay == null){
                layer.msg("请填写投放天数");
            }else {
                deliveryModal();
            }
        }


        /**确认提交**/
        function deliverySure() {
            var load = layer.load();
            $scope.list.load();
            $scope.item = JSON.parse(sessionStorage.item);
            var itemSelectArray = [];
            angular.forEach($scope.listGoods.items,function(item){
                if(item.itemSelect == true) {
                    var arrItem = {'numiid':item.numIid,'picurl':item.picUrl,'title':item.title,'price':item.price};
                    itemSelectArray.push(arrItem);
                }
            })
            var itemsJson = JSON.stringify(itemSelectArray);
            var obj = {itemsJson:itemsJson,pageId:$scope.item.id,payDay :$scope.item.payDay };
            if(itemSelectArray.length == 0) {
                layer.msg("请选择投放的商品");
                $scope.listGoods.load();
                layer.close(load);
                delete $scope.listGoods.filterOptions.keyword;
            }else if(itemSelectArray.length > 5){
                layer.msg("投放的商品不能超过5个");
                $scope.listGoods.load();
                layer.close(load);
                delete $scope.listGoods.filterOptions.keyword;
            }else {
                flowcarefreetask.wechatPay(obj).then(function(response){
                    $scope.listGoods.load();
                    delete $scope.listGoods.filterOptions.keyword;
                    var msg = JSON.parse(response.data);
                    $scope.notice = msg.content;
                    if(response.success == true) {
                        if($scope.notice.indexOf("您的余额不足") > -1){
                            accountModal();
                            layer.close(load);
                        }else {
                            layer.close(load);
                            layer.msg(msg.content);
                            $scope.list.load();
                        }
                    }else {
                        layer.msg(msg.msg);
                    }
                })
            } 
        }


        /**获取文章列表**/
        function categoryList() {
            angular.forEach($scope.list.items,function(item){
                 if(item.url){
                     angular.extend(item,item,{
                        dataPut:true
                     })
                 }
                 angular.extend(item,item,{
                     price:item.price/100
                 })
                 angular.extend(item,item,{
                    page_pic:"http://121.199.162.148"+item.page_pic
                 })
                 if(item.read_num >= 100000) {
                    angular.extend(item,item,{
                        read_num:"100000+"
                    })
                 }
            })
            $scope.lists = $scope.list.items;
            pagination($scope.list.total);
        }


        /**获取在售商品列表**/
        function categoryListOnsale() {
            $scope.listGoodsItems = $scope.listGoods.items;
            angular.forEach($scope.listGoodsItems,function(item){
                angular.extend(item,item,{
                    itemSelect:false
                })
            })
        }

        /**HTML反转义**/
        function HTMLDecode(text) { 
            var temp = document.createElement("div"); 
            temp.innerHTML = text; 
            var output = temp.innerText || temp.textContent; 
            temp = null; 
            return output; 
        }


        /**转义标签**/
        function html_encode(str){   
          return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&quot;/g, "\"")
                .replace(/&0A;/,"").replace(/data-src&3D;/g,'src=').replace(/&3D;/g, "=").replace(/data-w=""/g).replace(/width/g," ")
                .replace(/&0A;/g,'').replace(/&nbsp;/g,'');
        }


        /**全选**/
        function Select(allSelect) {
            var itemArrayFive = [];
            if($scope.listGoods.total<5){
                for(var i=0;i<$scope.listGoods.total;i++){
                    itemArrayFive.push($scope.listGoods.items[i])
                }
            }else {
                for(var i=0;i<5;i++){
                    itemArrayFive.push($scope.listGoods.items[i])
                } 
            }
            angular.forEach(itemArrayFive,function(item){
                angular.extend(item,item,{
                    itemSelect:allSelect?true:false
                })
            })
        }


        /**数字加减**/     
        function setDay(payDay,item) {
            console.log(payDay);
            console.log(item);
        }


        /**投放价格区间**/
        function priceDownChange(obj) {
            if(obj<0){
                $scope.priceDown = 0;
            }
        }

        function priceUpChange(obj) {
            if(obj<0){
                $scope.priceUp = 0;
            }
        }

        function readCountAdd(number) {
            $scope.list.filterOptions.readNum = number;
            $scope.list.load();
        }

        function readCountLese(number) {
            $scope.list.filterOptions.readNum = number;
            $scope.list.load();
        }



        /**查看全部投放商品**/
        function checkAlldelivery(number) {
            $scope.list.filterOptions.pageStatus = 0;
            $scope.list.load();
        }


        /**查看未投放商品**/
        function checkNodelivery(number) {
            $scope.list.filterOptions.pageStatus = 1;
            $scope.list.load();
        }


        /**搜索**/
        function searchGoods(pageNo) {
            if($scope.searchKey == null && $scope.startTime == null && $scope.endTime == null && $scope.readNum == null  && $scope.priceUp == null && $scope.priceDown == null){
                layer.msg("请填写你要搜索的信息");
                $scope.list.load();
            }else if($scope.priceUp <= $scope.priceDown){
                layer.msg("请输入比 "+$scope.priceDown +" 更高的价格！");
            }else {  
                $scope.list.filterOptions.keyword = $scope.searchKey?$scope.searchKey:'';
                $scope.list.filterOptions.postDateUp = $scope.endTime?$scope.endTime:'';
                $scope.list.filterOptions.postDateDown = $scope.startTime?$scope.startTime:'';
                $scope.list.filterOptions.readNum = $scope.readNum?$scope.readNum:'0';
                $scope.list.filterOptions.priceUp = $scope.priceUp*100?$scope.priceUp*100:'';
                $scope.list.filterOptions.priceDown = $scope.priceDown*100?$scope.priceDown*100:'0';
                $scope.list.filterOptions.pageNo = pageNo;
                $scope.list.load();
            } 
        } 

        
        /**搜索**/
        function listLoad(pageNo) {
            $scope.list.filterOptions.pageNo = pageNo;
            $scope.list.load();
        }

        /**分页**/
        function pagination(total){
            $('.goodsPage').pagination({
                itemsCount: total,
                styleClass: ['pagination-large'],
                showCtrl: true,
                displayPage: 6,
                onSelect: function (num) {
                    listLoad(num);
                }
            })
            $('.goodsPage').pagination('updateItemsCount',$scope.list.total);
        }



        /***在售商品列表分页和搜索设置***/
        /**搜索**/
        function searchGoodsOnsale(searchKeya,pageNo) {
            if(searchKeya == undefined || searchKeya == "" || searchKeya == null){
                layer.msg("请输入宝贝名称");
            } else {  
                $scope.listGoods.filterOptions.keyword = searchKeya;
                $scope.listGoods.filterOptions.pageNo = pageNo;
                $scope.listGoods.load();
            } 
        } 

        
        /**搜索**/
        function listLoadOnsale(pageNo) {
            $scope.listGoods.filterOptions.pageNo = pageNo;
            $scope.listGoods.load();
        }


        /**时间**/
        $('#demo4.input-daterange').datepicker({
            beforeShowDay: function (date){
              if (date.getMonth() == (new Date()).getMonth())
                switch (date.getDate()){
                  case 4:
                    return {
                      tooltip: 'Example tooltip',
                      classes: 'active'
                    };
                  case 8:
                    return false;
                  case 12:
                    return "green";
                }
            }
        });

        
    };
})(window.angular);