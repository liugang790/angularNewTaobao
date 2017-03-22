(function(angular, undefined){'use strict';

    angular.module('flowcarefreemisc.mybaby',[])
        .config(Configure)
        .controller('mybabyCtrl', mybabyCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.goods.mybaby', {
                url: '/mybaby',
                parent: 'member.flowcarefree.goods',
                templateUrl: '/template/flowcarefree/flowcarefreemisc/myBaby.tpl.html',
                controller: 'mybabyCtrl',
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
    function mybabyCtrl($scope, $state, currentShop, $compile, flowcarefreegetservice, listFactory, flowcarefreetask) {
        $scope.currentShop = currentShop;
        $scope.sex = "综合";
        $scope.price = "";
        $scope.id = 3;
        $scope.selectKind = selectKind;
        $scope.successModal = successModal;
        $scope.addVip = addVip;
        $scope.setValue = setValue;
        $scope.categoryList = categoryList;
        $scope.Select = Select;
        $scope.sure = sure;
        $scope.listLoad = listLoad;
        $scope.startPutAd = startPutAd;
        $scope.searchGoods = searchGoods;
        $scope.setPrice = setPrice;
        $scope.reload = reload;
        $scope.list = listFactory.$new(flowcarefreegetservice.Onsale);
        $scope.list.load();
        $scope.list.addLoadCallback(categoryList);

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
        
        /**flowModal**/
        function selectKind() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/flowcarefreemisc/flowModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }


        /**投放成功后显示弹框**/
        function successModal() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/flowcarefreemisc/successModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }

        /**版本升级显示弹框**/
        function addVip() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/flowcarefreemisc/addVipModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }


        function setValue(item,id){
            $scope.sex = item;
            $scope.id = id;
        }

        /**获取店铺分类**/
        flowcarefreegetservice.rewardcategory().then(function(data){
            $scope.category = data.data.category;
            $scope.sexa = data.data.cateId == "1" ? "男性" : data.data.cateId == "2" ? "女性" : data.data.cateId == "3" ? "综合" : "综合";
            $scope.sex = data.data.cateId == "1" ? "男性" : data.data.cateId == "2" ? "女性" : data.data.cateId == "3" ? "综合" : "综合";
        });


        /**获取list列表数据**/
        function categoryList() {
             pagination($scope.list.total);
            $scope.lists = $scope.list.items;
            angular.forEach($scope.list.items,function(item){
                angular.extend(item,item,{
                    "itemSelect":false
                })
            })
        }


        /**选中列表项目**/
        function Select() {
            $scope.list.items.forEach(function(item){
                angular.extend(item,item,{
                    itemSelect:$scope.allSelect?true:false
                })
                if(item.is3D == true) {
                    item.itemSelect  = false;
                }
            })
        }

        /**列表刷新**/
        function reload() {
            $scope.list.load();
        }

        /**搜索**/
        function searchGoods(pageNo) {
            if($scope.searchKey == undefined || $scope.searchKey == "" || $scope.searchKey == null){
                layer.msg("请输入宝贝名称");
            } else {  
                $scope.list.filterOptions.keyword = $scope.searchKey;
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
        function pagination(){
            $('.goodsPage').pagination({
                itemsCount: $scope.list.total,
                styleClass: ['pagination-large'],
                showCtrl: true,
                displayPage: 6,
                onSelect: function (num) {
                    listLoad(num);
                }
            })
            $('.goodsPage').pagination('updateItemsCount',$scope.list.total);
        }


        /**选择分类**/
        /**设置投放类型**/
        function sure(sex,id) {
            var cateId = id;
            var obj = {cateId:cateId}
            flowcarefreetask.setShopcate(obj).then(function(response){
                var message = JSON.parse(response.data)
                if(response.success == true) {
                    layer.msg(message.msg);
                     $scope.sexa = sex;
                }else {
                    layer.msg(response.error);
                }
            });
        }

        /**设置推广价格**/
        function setPrice(item,price){
             angular.forEach($scope.list.items,function(list){
                if(item.numIid == list.numIid){
                    angular.extend(list,list,{
                        newPrice:parseInt(price)==price?price+'.00':price
                    })
                }
             })
        }

        /**开始投放返回成功个数**/
        function startPutAd() {
            var load = layer.load();
            var itemsArray = [],itemsArrayFaile = [];
            angular.forEach($scope.list.items,function(item){
                if(item.itemSelect == true){ 
                    if(item.newPrice){
                        var arrItem = {'numiid':item.numIid,'picurl':item.picUrl,'title':item.title,'price':item.newPrice};
                    }else {
                        var arrItem = {'numiid':item.numIid,'picurl':item.picUrl,'title':item.title,'price':item.price};//循环拼接一个新的json对象
                    } 
                    itemsArray.push(arrItem);         
                }
                if(item.itemSelect == false){
                    itemsArrayFaile.push(item);
                    if(itemsArrayFaile.length == $scope.list.items.length) {
                        layer.msg("请选择投放的商品");
                    }
                }
            }) 
            var  itemsArrayStr = JSON.stringify(itemsArray);
            var obj = {itemArrayStr:itemsArrayStr};
            if(itemsArray == "" || itemsArray == null){
                layer.msg("请选择投放的商品");
                layer.close(load);
            }else{
                flowcarefreetask.putAd(obj).then(function(response){
                    console.log(response);
                    if(response.success == true){
                        layer.close(load);
                        successModal();
                    }else {
                        layer.msg(response.error);
                    }
                    // if(response.success == false){
                    //     console.log(response.error);
                    //     layer.msg(response.error);
                    //     layer.close(load);
                    // }    
                },function(faileMessage){
                    console.log(faileMessage);
                    addVip();
                    layer.close(load);
                    $scope.faileMessage = faileMessage.error;
                    $scope.appInfo = JSON.parse(sessionStorage.appInfo);
                    console.log($scope.appInfo.deadline.itemCode);
                    if($scope.appInfo.deadline.itemCode == "vip1"){
                        $scope.vip1 = true;
                    }
                    if($scope.appInfo.deadline.itemCode == "vip0"){
                        $scope.vip0 = true;
                    }
                }) 
            } 
        }
    };
})(window.angular);