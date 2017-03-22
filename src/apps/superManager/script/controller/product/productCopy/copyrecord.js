(function(angular, undefined){'use strict';

    angular.module('productCopy.copyrecord',[])
        .config(Configure)
        .controller('copyrecordCtrl',copyrecordCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.copy.copyrecord', {
                url: '/copyrecord',
                parent: 'member.product.copy',
                templateUrl: '/template/product/productCopy/copyrecord.tpl.html',
                controller: 'copyrecordCtrl',
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
  function copyrecordCtrl($scope, $state, currentShop, $compile, listFactory, productcopyGetCopyTask){
    $scope.list = listFactory.$new(productcopyGetCopyTask.getCopyTask);
    $scope.list.load();
    $scope.list.addLoadCallback(allGoods);
    $scope.currentShop = currentShop;
    $scope.activeAll = false;
    $scope.activeWait = true;
    $scope.activeCopying = true;
    $scope.activeSuccess = true;
    $scope.activeFail = true;
    var arrayList = [];
    function errorMessage() {
      var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                    +'<div ng-include="\''+'/template/product/productCopy/errorMessageModal.tpl.html'+'\'"></div>'+'</div>';
      var copyTaskModalInstance = angular.element(html);
      $('.container').after(copyTaskModalInstance);
      $compile(copyTaskModalInstance)($scope);
      $(copyTaskModalInstance).modal({backdrop:true});
    }
    function clearSucces(item){
      if(item.mark.indexOf("!")>0){
        angular.extend(item,item,{
          mark:item.mark.replace('!','')
        })
      } 
    }
    function clearFail(item){
      if(item.mark.indexOf(";")>0){
        var markStr = item.mark.split(";")
        var errorMessage = markStr[1];
        item.errorMessage = errorMessage;
        if(item.errorMessage.indexOf("您必须选择交易保障工具") != -1){
           angular.extend(item,item,{
               selectHref:true
           })
      } 
      }
    }
    function allGoods(){
        angular.forEach($scope.list.items,function(item){
            if(item.numiid.indexOf("jd") != -1){
                var id = item.numiid.split("jd");
                var urlHref = "https://item.jd.com/"+id[1]+".html";
            }else if(item.numiid.indexOf("alibaba") != -1){
                var id = item.numiid.split("alibaba");
                var urlHref = "https://detail.1688.com/offer/"+id[1]+".html?";
            }else {
                var urlHref = "http://item.taobao.com/item.htm?id="+item.numiid;
            }
            angular.extend(item,item,{
              "urlHref":urlHref
            })
        })
        $scope.filedReason  = function(item){
            $scope.item = item;
            errorMessage();
        } 
        angular.forEach($scope.list.items,function(item){
            switch(item.mark){
                case "复制成功":item.progressSuccess = true;
                                item.editGoods = true;
                break;
                case "正在复制中...":item.progressWarning = true;
                break;
                case "复制失败":item.progressDanger  = true;
                                item.failReason = true;
                break;
            }
        })
        $scope.changeTab  = function(index) {
            var arrayList;
            switch(index){
                case 0:$scope.activeAll = false;
                       $scope.activeWait = true;
                       $scope.activeCopying = true;
                       $scope.activeSuccess = true;
                       $scope.activeFail = true;
                        arrayList = [];
                        angular.forEach($scope.list.items,function(item){
                            clearSucces(item);
                            clearFail(item);
                         })
                        $scope.filedReason  = function(item){
                            $scope.item = item;
                            errorMessage();
                        }
                        angular.forEach($scope.list.items,function(item){
                            switch(item.status){
                                case "执行中":case "进入执行队列":
                                    angular.extend(item,item,{
                                        mark:"正在复制中..."
                                    }); 
                                break;
                                case "等待执行":
                                angular.extend(item,item,{
                                    mark:"等待复制"
                                });
                                break;
                                case "执行完成":
                                angular.extend(item,item,{
                                    mark:"复制成功"
                                });
                                break;
                                case "执行失败":
                                angular.extend(item,item,{
                                    mark:"复制失败"
                                });
                                break;
                            }
                        })
                        $scope.arrayList = $scope.list.items;
                        angular.forEach($scope.list.items,function(item){
                            switch(item.mark){
                                case "复制成功":item.progressSuccess = true;
                                                item.editGoods = true;
                                break;
                                case "正在复制中...":item.progressWarning = true;
                                break;
                                case "复制失败":item.progressDanger  = true;
                                                item.failReason = true;
                                break;
                            }
                        })
                break;
                case 1:$scope.activeAll = true;
                       $scope.activeWait = false;
                       $scope.activeCopying = true;
                       $scope.activeSuccess = true;
                       $scope.activeFail = true;
                        arrayList = [];
                        angular.forEach($scope.list.items,function(item){
                            clearSucces(item);
                            clearFail(item);
                        })
                        angular.forEach($scope.list.items,function(item){
                            switch(item.status){
                                case "等待执行":
                                angular.extend(item,item,{
                                    mark:"等待复制"
                                });
                                arrayList.push(item);
                                break;
                                }
                            })
                        $scope.arrayList = arrayList;
                break;
                case 2:$scope.activeAll = true;
                       $scope.activeWait = true;
                       $scope.activeCopying = false;
                       $scope.activeSuccess = true;
                       $scope.activeFail = true;
                       arrayList = [];
                        angular.forEach($scope.list.items,function(item){
                            switch(item.status){
                                case "执行中":case "进入执行队列":
                                angular.extend(item,item,{
                                    mark:"正在复制中..."
                                });
                                arrayList.push(item);
                                break;
                            }
                        })
                        $scope.arrayList = arrayList;
                break;
                case 3:$scope.activeAll = true;
                       $scope.activeWait = true;
                       $scope.activeCopying = true;
                       $scope.activeSuccess = false;
                       $scope.activeFail = true;
                        arrayList = [];
                        angular.forEach($scope.list.items,function(item){
                            clearSucces(item);
                            switch(item.status){
                                case "执行完成":
                                    angular.extend(item,item,{
                                        mark:"复制成功"
                                    });
                                    arrayList.push(item);
                                break;
                            }
                          })
                        $scope.arrayList = arrayList;
                break;
                case 4:$scope.activeAll = true;
                       $scope.activeWait = true;
                       $scope.activeCopying = true;
                       $scope.activeSuccess = true;
                       $scope.activeFail = false;
                       arrayList = [];
                       angular.forEach($scope.list.items,function(item){
                            clearFail(item);
                            switch(item.status){
                                case "执行失败":
                                    angular.extend(item,item,{
                                        mark:"复制失败"
                                    });
                                    arrayList.push(item);
                                break;
                            }
                            $scope.filedReason  = function(item){
                                 $scope.item = item;
                                 errorMessage();
                            }
                        })
                      $scope.arrayList = arrayList;
                 break;
            }
         }
        $scope.listLoad = function() {
            $scope.list.filterOptions.searchKey = $scope.searchKey;
            $scope.list.load();
        }
        $scope.changeTab(0);
        } 
    } 
})(window.angular);