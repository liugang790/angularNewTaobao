(function(angular,undefined){'use strict';

  angular.module('phoneDetail.developRecord',['service.phoneDetail.record', 'monospaced.qrcode'])
   .config(Configure)
   .controller('developRecordCtrl', developRecordCtrl);

   /**
    * @ngInject
    */
   function Configure($stateProvider) {
     $stateProvider
     .state('member.product.phone.developRecord',{
        url:'/developRecord',
        parent:'member.product.phone',
        templateUrl:'/template/product/phoneDetail/developRecord.tpl.html',
        controller:'developRecordCtrl',
        resolve: {}
     })
   }


    /**
    * @ngInject
    */
    function developRecordCtrl($scope, listFactory, phoneRecord){
        $scope.listLoad     = listLoad;
        $scope.viewHtml     = viewHtml;
        $scope.qrcodeS       = qrcodeS;

        $scope.list = listFactory.$new(phoneRecord.list);
        $scope.list.addLoadCallback(function (){
            pagination($scope.list.total);
        });
        $scope.list.load();

        function listLoad(pageNo) {
            if($scope.searchKey == undefined){
                $scope.list.filterOptions.searchKey = "";
            } else {
                $scope.list.filterOptions.searchKey = $scope.searchKey;
            }
            $scope.list.filterOptions.pageNo = pageNo;
            $scope.list.load();
        }

        function viewHtml(numiid){
            phoneRecord.viewHtml({numiid : numiid}).then(function(result){
                layer.open({
                    type: 1,
                    title: false,
                    closeBtn: 0,
                    shadeClose: true,
                    skin: 'yourclass',
                    area: ['420px', '760px'],
                    content: '<div class="developphonedetailphone" style="width:100%;height:100%;">'
                    + '<div style="overflow: auto;text-align: center;width: 100%;height: 100%;color:#ffffff;">'
                    + '<div style="overflow: auto;text-align: center;width: 100%;height: 100%;color:#ffffff;padding-left:14px;margin-top: 58px;">'
                    + result.items
                    + '</div>'
                    + '</div>'
                    + '</div>'
                });
            });
        }

        function qrcodeS(numiid){
            $scope.qrcodeUrl = "http://h5.m.taobao.com/awp/core/detail.htm?id=" + numiid;
            $('#myModal').modal('show');
        }

        function pagination(pageTotal){
            var pageNo = pageTotal % 10 == 0 ? parseInt(pageTotal / 10) : parseInt(pageTotal / 10) + 1;
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