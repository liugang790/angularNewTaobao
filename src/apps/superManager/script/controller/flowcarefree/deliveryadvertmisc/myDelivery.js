(function(angular, undefined){'use strict';

    angular.module('deliveryadvertmisc.myadvert',[])
        .config(Configure)
        .controller('myadvertCtrl', myadvertCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.flowcarefree.advert.myadvert', {
                url: '/myadvert',
                parent: 'member.flowcarefree.advert',
                templateUrl: '/template/flowcarefree/deliveryadvertmisc/myDelivery.tpl.html',
                controller: 'myadvertCtrl',
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
    function myadvertCtrl($scope, $sce, $state, currentShop, listFactory, flowcarefreegetservice, systemMath, $compile) {
        $scope.currentShop = currentShop;
        $scope.myDeliveryModal = myDeliveryModal;
        $scope.categoryList = categoryList;
        $scope.ewmModal = ewmModal;
        $scope.listLoad = listLoad;
        $scope.list = listFactory.$new(flowcarefreegetservice.wechatListover);
        $scope.list.load();
        $scope.list.addLoadCallback(categoryList);


        /**已投放文章查看弹框**/
        function myDeliveryModal(item) {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/deliveryadvertmisc/myDeliveryModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
            $scope.itemUrl = item.url;
                $scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                }
                $scope.movie = item.url;
            }


        /**二维码查看**/
        function ewmModal(item) {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/flowcarefree/deliveryadvertmisc/ewmModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
            $scope.qrcodeUrl = item.url;
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


        /**获取已经投放列表**/
        function categoryList() {
             pagination($scope.list.total);
            $scope.items = $scope.list.items;
            angular.forEach($scope.items,function(item){
                angular.extend(item,item,{
                    deadline:systemMath.toDateString(new Date(item.deadline),true)
                })
                angular.extend(item,item,{
                    pay_time:systemMath.toDateString(new Date(item.pay_time),true)
                })
                angular.extend(item,item,{
                    page_pic:"http://121.199.162.148"+item.page_pic
                })
            })
        }


        /**搜索**/
        function listLoad(pageNo) {
            $scope.list.filterOptions.page = pageNo;
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
        
    };
})(window.angular);