(function(angular, undefined){'use strict';

    angular.module('flowcarefreemisc.deliverybaby',[])
        .config(Configure)
        .controller('deliverybabyCtrl', deliverybabyCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.goods.deliverybaby', {
                url: '/deliverybaby',
                parent: 'member.flowcarefree.goods',
                templateUrl: '/template/flowcarefree/flowcarefreemisc/deliveryBaby.tpl.html',
                controller: 'deliverybabyCtrl',
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
    function deliverybabyCtrl($scope, $state, currentShop, listFactory, flowcarefreegetservice, flowcarefreetask, $compile) {
        $scope.currentShop = currentShop;
        $scope.listLoad = listLoad;
        $scope.kindVipModal = kindVipModal;
        $scope.searchGoods = searchGoods;
        $scope.categoryList = categoryList;
        $scope.Select = Select;
        $scope.canclePut = canclePut;
        $scope.headPut = headPut;
        $scope.showIndex = showIndex;
        $scope.stopPut = stopPut;
        $scope.list = listFactory.$new(flowcarefreegetservice.showItems);
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

        /**kindVipModal**/
        function kindVipModal() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/flowcarefreemisc/kindVipModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }

        /**搜索**/
        function listLoad(pageNo) {
            if($scope.searchKey == undefined || $scope.searchKey == "" || $scope.searchKey == null){
                layer.msg("请输入宝贝名称");
            } else {  
                $scope.list.filterOptions.keyword = $scope.searchKey;
                $scope.list.filterOptions.pageNo = pageNo;
                var obj = {keyword:$scope.searchKey};
                flowcarefreegetservice.Onsale(obj).then(function(response){
                    console.log(response.data);
                 });
                 $scope.list.load();
            } 
        }

        /**返回的信息列表**/
        function categoryList() {
            $scope.lists = $scope.list.items;
            angular.forEach($scope.list.items,function(item){
                angular.extend(item,item,{
                    "itemSelect":false
                })
            })

            /**分页器**/
            $('.goodsPage').pagination({
                pages: $scope.list.total,
                styleClass: ['pagination-large'],
                showCtrl: true,
                displayPage: 6,
                onSelect: function (num) {
                    listLoad(num);
                }
            })
            /**遍历添加itemData**/
            angular.forEach($scope.list.items,function(item){
                angular.extend(item,item,{

                })
            })
        }


        /**选中列表项目**/
        function Select() {
            $scope.list.items.forEach(function(item){
                angular.extend(item,item,{
                    itemSelect:$scope.allSelect?true:false
                })
            })
        }

        /**投放到首页**/
        function showIndex(item) {
            var obj = {goodsId:item.id};
            flowcarefreetask.showItemsHomeAdd(obj).then(function(response){
                if(response.success == true) {
                    var rsp = angular.fromJson(response.data);
                    if(rsp.status == true){
                        layer.msg(rsp.msg)
                    } else {
                        $scope.message = rsp.msg;
                        kindVipModal();
                    }
                    $scope.list.load();
                }else {
                    layer.msg(response.error);
                }
             })
        }

        /**取消投放到首页**/
        function canclePut(item) {
            var obj = {id:item.home_id};
            flowcarefreetask.showItemsHomeDel(obj).then(function(response){
                if(response.success == true) {
                    layer.msg("取消投放成功");
                    $scope.list.load();
                }
            })
        }

        /**顶置到首页**/
        function headPut(item) {
            var obj = {id:item.home_id};
            flowcarefreetask.showItemsHomeHead(obj).then(function(response){
                var mesData = JSON.parse(response.data);
                if(response.success == true) {
                    layer.msg(mesData.content);
                    $scope.list.load();
                }
            })
        }

        /**停止投放页**/
        function stopPut() {
            var itemSelectArray = [];
            angular.forEach($scope.list.items,function(item){
                if(item.itemSelect == true){
                    itemSelectArray.push(item);
                }
            });
            if(itemSelectArray.length == 0){
                layer.msg("请选择停止投放的商品");
            }else {
                // 请求商品投放页数据
                var  itemsArrayStr = JSON.stringify(itemSelectArray);
                var obj = {itemArrayStr:itemsArrayStr};
                flowcarefreetask.stopPut(obj).then(function(response){
                    if(response.success == true){
                        layer.msg("操作成功");
                        $scope.list.load();
                    } else {
                        layer.msg("操作失败，请稍后重试");
                        $scope.list.load();
                    }
                });
            }

        }



        /**分页**/
        function listLoad(pageNo) {
            $scope.list.filterOptions.pageNo = pageNo;
             $scope.list.load(); 
        }

        /**搜索**/
        function searchGoods(pageNo) {
            if($scope.searchKey == undefined || $scope.searchKey == "" || $scope.searchKey == null){
                layer.msg("请输入宝贝名称");
            } else {  
                var obj = {keyword:$scope.searchKey};
                $scope.list.filterOptions.keyword = $scope.searchKey;
                $scope.list.filterOptions.pageNo = pageNo;
                flowcarefreegetservice.showItems(obj).then(function(response){
                });
                $scope.list.load();
            } 
        }   
    };
})(window.angular);