(function(angular, undefined){'use strict';

	angular.module('productCopy.copyTaobaoTmall',[])
		.config(Configure)
		.controller('copyTaobaoTmallCtrl', copyTaobaoTmallCtrl);
	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
        $stateProvider
        .state('member.product.copy.taobaoandtmall', {
            url: '/taobaoandtmall',
            parent: 'member.product.copy',
            templateUrl: '/template/product/productCopy/taobaoAndTmall.tpl.html',
            controller: 'copyTaobaoTmallCtrl',
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
	function copyTaobaoTmallCtrl($scope, $rootScope, $state, $compile, $interval, currentShop, listFactory, productcopy, productcopytask, $timeout, appInfo) {
        $scope.currentShop = currentShop;
		$scope.menuSelect = true;
        $scope.ifSku = true;
        $scope.ifLink = true;
        $scope.autoWapDesc = true;
        $scope.filterDup = true;
        $scope.graphicMode = true;
        $scope.dPrice = false;
        $scope.flipImage = false;
        $scope.syncGoods = false;
        $scope.linkGoods = false;
        $scope.selectSellerCatId = 0;
        $scope.selectTemplateId = 0;
        $scope.selectCategoryId = 0;
        var time;   
        var pageSize = 10;
        var page;
        var skip = 0;
        var currentPage=1;


        /***tooptitle***/
        $scope.toolTipOptions = {container: $('body')};
        $scope.wholeMjsHelpPop = '<div style="text-align:center;"><h4 style="color:#28a3ef;font-size:18px;">主图反转效果</h4><div>'+
                                     '<div style="display:flex;justify-content:space-between"><span  style="display:block;text-align:center;"><img src="image/picturea.jpg" style="width:80%;"></span>'+
                                     '<span style="display:block;text-align:center"><a style="display:inline-block;margin-right:20px;font-weight:bold;color: red;">>></a><img src="image/pictureb.png" style="width:70%;"></span></div>'+
                                    '</div></div>';  
		$scope.toggleBtn  = function () {
            $scope.menuSelect = !$scope.menuSelect;
		}
        $scope.setValue = function (value, key){
            $scope[value] = key;
        }
        $scope.deleteInput = function(){
            $scope.copyLink = "";
        }
        $scope.deleteInputWay = function(){
            $scope.gsellerOther = "";
            $scope.gsearchKey = "";
        }
        $scope.pageChange = function(num) {
            if($scope.list.page !== num) {
                $scope.list.page = num;
                $scope.list.load();
            }
        }
		var arrurl,arrayurl,arrid,id;
		var arrayId = [];
		productcopytask.deliveryTemplates().then(function(templates){
            var newtemplate = {name:"默认运费模板",id:0}
            templates.unshift(newtemplate);
            $scope.templates = templates;
		});
		productcopytask.sellerCats().then(function(sellerCats){
			var newsellerCat = {name:"默认宝贝分类",id:0}
			sellerCats.unshift(newsellerCat);
			$scope.sellerCats = sellerCats;
		});
		productcopytask.pictureCategory().then(function(Categorys){
			var newCategory = {picture_category_name:"默认图片目录",picture_category_id:0}
			Categorys.unshift(newCategory);
			$scope.Categorys = Categorys;
		});
		var NumberId = function () {
            var urls = $scope.copyLink.split("\n");
            if(urls.length>1){
                for(var i=0;i<urls.length;i++){
                    if(test.test(urls[i])){
                        arrurl = urls[i].split("id=");
                        if(arrurl[1].indexOf("&")>0){
                            arrid = arrurl[1].split("&");
                            id = arrid[0]; 
                        }else{
                            id = arrurl[1];
                        }
                        arrayId.push(id);
                    }else {
                        layer.msg('商品链接错误:' + urls[i]);
                        $scope.isLoading = true;
                        return false;
                    }
                }
                var newArray = [];
                for(var i = 0;i<arrayId.length;i++){
                    if(newArray.indexOf(arrayId[i]) == -1){
                        newArray.push(arrayId[i]);
                    }
                }
                return newArray;
                id =  newArray.join(",");
                return id;
            }else {
                arrurl = $scope.copyLink.split("id=");
                arrid = arrurl[1].split("&");
                id = arrid[0];
                return id;
            }
        };
        var  URLcheck = "(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?";
        var  test = new RegExp(URLcheck);
	    $scope.searchGoods = function () {
            if(($scope.copyLink == "" || $scope.copyLink == null) && ($scope.gsellerOther  == ""|| $scope.gsellerOther == null) && ($scope.gsearchKey == "" || $scope.gsearchKey == null)){
		    	layer.msg("请输入宝贝链接");
		    }else if(test.test($scope.copyLink)){
                $scope.list = listFactory.$new(productcopy.query);
		    	$scope.list.filterOptions.numiids = NumberId();
		    	$scope.list.load();
                $scope.list.addLoadCallback(addItemselect);       
			}else if(($scope.gsellerOther && $scope.gsearchKey) || $scope.gsellerOther){
                $scope.list = listFactory.$new(productcopy.query);
                $scope.list.filterOptions.gsellerOther = $scope.gsellerOther;
		        $scope.list.filterOptions.gsearchKey = $scope.gsearchKey;
                $scope.list.filterOptions.pageNo = 1;
                $scope.list.pageSize = 24;
                $scope.list.load();
                $scope.list.addLoadCallback(addItemselect);
			}else if(!$scope.gsellerOther && $scope.gsearchKey){
                    layer.msg("请输入店铺旺旺号搜索");
            }else{
                layer.msg("请输入正确宝贝链接");
            }
        }
        function addItemselect() {
            $scope.allItems = $scope.list.items;
            angular.forEach($scope.list.items,function(item){
                    var urlHref = "http://item.taobao.com/item.htm?id="+item.numiid;
                    angular.extend(item,item,{
                        "urlHref":urlHref
                    })
                });
                $scope.list.items.forEach(function(item){
                    angular.extend(item,item,{
                        "itemSelect":false
                    })
                });    
        }
        function pagination(){
            // skip = ($scope.list.page-1)*24;
            // $scope.list.items = $scope.allItems.slice(skip, 24+skip);
            // page = Math.ceil($scope.list.total / 24);
            // console.log(page);
            $('.goodsPage').pagination({
               itemsCount: $scope.list.total,
                // pages: 29,
                showCtrl: true,
                styleClass: ['pagination-large'],
                displayPage: 6,
                onSelect: function (num) {
                    $scope.list.page = num;
                    $scope.list.load();
                }
            });
            $('.goodsPage').pagination('updateItemsCount',$scope.list.total);
        } 
        $scope.selectSellerCat = function(id){
            $scope.selectSellerCatId = id;
        }
        $scope.selectTemplate = function(id){
            $scope.selectTemplateId = id;
        }
        $scope.selectCategory = function(id){
            $scope.selectCategoryId = id;
        }
        $scope.Select = function(){
            $scope.allSelect = !$scope.allSelect;
            $scope.list.items.forEach(function(item){
                angular.extend(item,item,{
                    itemSelect:$scope.allSelect?true:false
                })
            })
        }
        function copyTask() {
            var html= '<div tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
                        +'<div ng-include="\''+'/template/product/productCopy/copyTaskModal.tpl.html'+'\'"></div>'+'</div>';
            var copyTaskModalInstance = angular.element(html);
            $('.container').after(copyTaskModalInstance);
            $compile(copyTaskModalInstance)($scope);
            $(copyTaskModalInstance).modal({backdrop:true});
        }
        $scope.startCopy = function () {
            var items = $scope.list.items,
            selectItem = [];
            items.forEach(function(item){
                if(item.itemSelect == true){
                    selectItem.push(item);
                }
            });
            if(selectItem == null || selectItem == ""){
                layer.msg("请选择复制商品");
            }else{
                $scope.subscribeVer = appInfo.get('deadline').itemCode;
                if($scope.subscribeVer != 'vip2'){
                    if(selectItem.length > 1) {
                        // 弹窗提示
                        $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                        return;
                    }
                }
                var jaStr = JSON.stringify(selectItem);
                var settingStr = {"ifSku": $scope.ifSku + "","ifLink": $scope.ifLink + "","autoWapDesc": $scope.autoWapDesc + "",
                                "shopcatId": $scope.selectSellerCatId + "","deliveryId": $scope.selectTemplateId + "",
                                "picdirId": $scope.selectCategoryId + "",
                                "priceMultiply": "","priceAdd":"","dPrice": $scope.dPrice + "","approveStatus":"instock",
                                "filterDup": $scope.filterDup + "","syncGoods": "false",
                                "cid": 0 + "","flipImage":$scope.flipImage,"graphicMode": $scope.graphicMode + ""};
                var settingStr = JSON.stringify(settingStr),
                params = {jaStr:jaStr,settingStr:settingStr},
                progressparams = {itemStr:jaStr};
                function  itemProcess(){
                    productcopytask.itemProcess(progressparams).then(function(response){
                        console.log(response);
                        $scope.copyProcessItems = JSON.parse(jaStr);
                        angular.forEach($scope.copyProcessItems,function(a){
                            angular.forEach(response,function(b){
                                if(b.mark){
                                    if(b.mark.indexOf(";")>0){
                                        var itemarray = b.mark.split(";");
                                        // console.log(itemarray[1]);
                                        angular.extend(b,b,{
                                            mark:itemarray[0]
                                        })
                                    }
                                    if(b.mark.indexOf("!")>0){
                                        angular.extend(b,b,{
                                            mark:b.mark.replace('!','')
                                        })
                                    }
                                }
                                if(a.numiid == b.numiid){
                                    a.mark = b.mark;
                                    a.status = b.status;
                                }
                            })
                        })
                        angular.forEach($scope.copyProcessItems,function(item){
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
                                    })
                                }
                        })
                        $scope.progressWarning = false;
                        $scope.progressSuccess = false;
                        angular.forEach($scope.copyProcessItems,function(item){
                                switch(item.mark){
                                    case "正在复制中...":item.progressInfo = true;break;
                                    case "等待复制"     :item.progressWarning = true;break;
                                    case "复制成功"     :item.progressSuccess = true;;break;
                                    case "复制失败"     :item.progressDanger = true;;break;
                                }
                        })
                        var itemTotal =  $scope.copyProcessItems.length,
                        copyingArray = [],
                        copyArray = [],
                        percent;
                        $scope.progressWidth = {};
                        $scope.progressFont = "正在努力复制宝贝，请您耐心等待...";
                        $scope.progressWidth = {};
                        $scope.progressWidth.width = "5%";
                        $scope.progressWidth.percent = "5%";
                        angular.forEach($scope.copyProcessItems,function(item){
                            if(item.mark == "复制成功" || item.mark == "复制失败"){
                                if($scope.linkGoods && item.mark == "复制成功"){
                                    //复制成功后返回的ID
                                    params = {numiid : item.numiid, newNumiid : item.newNumiid};
                                    productcopytask.linkGoods(params).then(function(response){});
                                }
                                copyingArray.push(item);
                                var copyingArrayTotal = copyingArray.length;
                                percent = Math.round(copyingArrayTotal / itemTotal * 10000) / 100.00 + "%";
                                if(percent == "100%"){
                                    $scope.progressWarning = true;
                                    $scope.progressWidth.width = percent;
                                    $scope.progressWidth.percent;
                                    $scope.progressFont = "全部商品已经复制完成啦~~";
                                    clearInterval(time);
                                }else {
                                    if(percent>"30%" && percent<"60%"){
                                        $scope.progressSuccess = true;
                                    }
                                    if(percent>"60%"){
                                        $scope.progressWarning = true;
                                    }
                                    $scope.progressWidth.width = percent;
                                    $scope.progressWidth.percent;
                                    $scope.progressFont = "正在努力复制宝贝，请您耐心等待...";
                                }
                            }
                        })
                    })
                }
                productcopytask.addItemCopy(params).then(function(response){
                    if(response.success){
                        copyTask();
                        itemProcess();
                        time = setInterval(itemProcess,5000);
                    } else {
                        if(response.error.indexOf('超过最大复制限额') != -1){
                            $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                        } else {
                            layer.msg(response.error);
                        }
                    }
                });
            }
        }
    };   
})(window.angular);