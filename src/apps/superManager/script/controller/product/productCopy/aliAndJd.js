(function(angular, undefined){'use strict';
    angular.module('productCopy.copyAlAndJd',[])
        .config(Configure)
        .controller('copyAlJdallCtrl', copyAlJdallCtrl);
    /**
    * @ngInject
    */
    function Configure($stateProvider) {
        $stateProvider
            .state('member.product.copy.alAndJdall', {
                    url: '/alAndJdall',
                    parent: 'member.product.copy',
                    templateUrl: '/template/product/productCopy/alAndJdall.tpl.html',
                    controller: 'copyAlJdallCtrl',
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
   function copyAlJdallCtrl($scope, $rootScope, $state, $compile, $interval, currentShop, listFactory, productcopy, productcopytask, $timeout, appInfo) {
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
        $scope.selectSellerCatId = 0;
        $scope.selectTemplateId = 0;
        $scope.selectCategoryId = 0;
        var time;
        
        /**tooltip**/
        $scope.toolTipOptions = {container: $('body')};
        $scope.wholeMjsHelpPop = '<div style="text-align:center;"><h4 style="color:#28a3ef;font-size:18px;">主图反转效果</h4><div>'+
        '<div style="display:flex;justify-content:space-between"><span  style="display:block;text-align:center;width:50%;"><img src="image/picturea.png" style="width:70%;"></span>'+
        '<span style="display:block;width:50%;text-align:center"><a style="display:inline-block;margin-right:20px;font-weight:bold;color:red;">>></a><img src="image/pictureb.png" style="width:70%;"></span></div>'+
        '</div></div>';
        /***数组去重***/
        Array.prototype.clearArray = function(){
             var res = [];
             var json = {};
                 for(var i = 0; i < this.length; i++){
                      if(!json[this[i]]){
                            res.push(this[i]);
                            json[this[i]] = 1;
                      }
                 }
             return res;
        }
        /***json对象去重***/
        Array.prototype.removeRepeatAttr=function(){
            var tmp={},b=[],a=this; 
            for(var i=0;i<a.length;i++){
                if(!tmp[a[i].name]){
                    b.push(a[i]);
                    tmp[a[i].name]=!0;
                }
            };
            return b;
        }  
        $scope.toggleBtn  = function () {
            $scope.menuSelect = !$scope.menuSelect;
        }
        $scope.setValue = function(value, key){
            $scope[value] = key;
        }
        var categories = [];
        productcopytask.getCatJson({fatherCid:0}).then(function(items){
            angular.forEach(items,function(list){
                list.fatherCid = 0;             
            })
            $scope.categories = items;
            $scope.level0CategoryName = "请选择类目";
            var itemName = [];
            $scope.selectkind = function(level, item){
                $scope[level + 'CategoryName'] = item.name;
                $scope[level + 'Cid'] = item.cid;       
                    productcopytask.getCatJson({fatherCid:item.cid}).then(function(items){                
                    console.log(items);
                    angular.forEach(items,function(list){
                        angular.extend(list,list,{
                            fatherCid:item.cid
                        })
                     $scope.categories.push(list);
                    })
                    $scope.categories = $scope.categories.removeRepeatAttr();
                    if($scope.level0Cid && !$scope.level1Cid){
                        var level1Cates = $scope.categories.filter(function(value, key){
                            return value.fatherCid === $scope.level0Cid
                        });
                        if(level1Cates == null || level1Cates == "") {
                            $scope.levelFirst = false;
                        }else {
                            $scope.levelFirst = true;
                        }
                        $scope.cid = $scope.level0Cid;
                        $scope.level1CategoryName = "请选择类目";
                        itemName.push(item.name);
                    }else if($scope.level1Cid && !$scope.level2Cid){
                        var level2Cates = $scope.categories.filter(function(value, key){
                            return value.fatherCid === $scope.level1Cid
                        });
                        if(level2Cates == null || level2Cates == "") {
                            $scope.levelSecond = false;
                        }else {
                            $scope.levelSecond = true;
                        }
                        $scope.level2CategoryName = "请选择类目";
                        $scope.cid = $scope.level1Cid;
                        itemName.push(item.name);
                    }else if($scope.level2Cid && !$scope.level3Cid){
                        var level3Cates = $scope.categories.filter(function(value, key){
                            return value.fatherCid === $scope.level2Cid
                        });
                        if(level3Cates == null || level3Cates == "") {
                            $scope.levelThird = false;
                        }else {
                            $scope.levelThird = true;
                        }
                        $scope.level3CategoryName = "请选择类目";
                        $scope.cid = $scope.level2Cid;
                        itemName.push(item.name);
                    }else if($scope.level3Cid && !$scope.level4Cid){
                        var level4Cates = $scope.categories.filter(function(value, key){
                            return value.fatherCid === $scope.level3Cid
                        });
                        console.log(level4Cates);
                        if(level4Cates == null || level4Cates == "") {
                            $scope.levelFourth = false;
                        }else {
                            $scope.levelFourth = true;
                        }
                        $scope.cid = $scope.level3Cid;
                        itemName.push(item.name);
                    }else if($scope.level4Cid){
                        $scope.cid = $scope.level4Cid;
                        itemName.push(item.name);
                    }else {
                        layer.msg("类目不存在");
                    }
                    // $scope.selectAllkind ="已选："+ itemName.clearArray().join("->");  
                    $scope.$watch(function(){return $scope.level0CategoryName}, function(newValue, oldValue){
                        if(newValue !== oldValue){
                            $scope.level1Cid = "";
                            $scope.level2Cid = "";
                            $scope.level3Cid = "";
                            $scope.levelSecond = false;
                            $scope.levelThird = false;
                            $scope.levelFourth = false;
                            $scope.selectAllkind = "";
                        }
                    });
                    $scope.$watch(function(){return $scope.level1CategoryName}, function(newValue, oldValue){
                        if(newValue !== oldValue){
                            $scope.level2Cid = "";
                            $scope.level3Cid = "";
                            $scope.levelThird = false;
                            $scope.levelFourth = false;
                        }
                    });
                    $scope.$watch(function(){return $scope.level2CategoryName}, function(newValue, oldValue){
                        if(newValue !== oldValue){
                            $scope.level3Cid = "";
                            $scope.levelFourth = false;
                        }
                    });
                    // $scope.$watch(function(){return $scope.level3CategoryName}, function(newValue, oldValue){
                    //     if(newValue !== oldValue){
                    //        $scope.levelThird = false;
                    //        $scope.levelFourth = false;
                    //     }
                    // });
                    }) 
                     
            }
        })
       function getId(url) {
            var arrayId = [],
                newArray = [],
                urls = url.split("\n");
            if(urls.length>1){
                for(var i = 0;i<urls.length;i++){
                    if (urls[i].indexOf(".1688.com/offer/") >= 0) {
                        var ss = urls[i].split(".1688.com/offer/");
                        var s1 = ss[ss.length - 1];
                        var id = "alibaba" + s1.split(".html")[0];
                        arrayId.push(id);
                    }else if (urls[i].indexOf("item.jd.com/") >= 0) { 
                        var ss = urls[i].split("item.jd.com/");
                        var s1 = ss[ss.length - 1];
                        var id = "jd" + s1.split(".html")[0];
                        arrayId.push(id);
                    } else if(urls[i].indexOf("product.suning.com") >= 0){
                        if(urls[i].indexOf("detail") >= 0){
                            var ss1 = urls[i].split("detail_")[1].split(".")[0];
                        } else {
                            var ss = urls[i].split(".html")[0];
                            ss = ss.split("com/")[1];
                            var ss1 = ss.split("/")[0] + '_' + ss.split("/")[1];
                        }
                        var id = "publicsuni_" + ss1;
                        arrayId.push(id);
                    } else if(urls[i].indexOf("item.yhd.com") >= 0){
                        var ss = urls[i].split("item/");
                        var ss1 = ss[1].split("?");
                        var id = "publicyhdi_" + ss1[0];
                        arrayId.push(id);
                    } else if(urls[i].indexOf("gome.com.cn") >= 0){
                        var ss = urls[i].split("cn/");
                        var ss1 = ss[1].split(".");
                        var id = "publicgome_" + ss1[0];
                        arrayId.push(id);
                    } else {
                        return "";
                    }
                } 
                 for(var i = 0;i<arrayId.length;i++){
                    if(newArray.indexOf(arrayId[i]) == -1){
                        newArray.push(arrayId[i]);
                    }
                }
                 return newArray.join(",");
            }else{
                    if (url.indexOf(".1688.com/offer/") >= 0) {
                        var ss = url.split(".1688.com/offer/");
                        var s1 = ss[ss.length - 1];
                        return "alibaba" + s1.split(".html")[0];
                    }else if (url.indexOf("item.jd.com/") >= 0) { 
                        var ss = url.split("item.jd.com/");
                        var s1 = ss[ss.length - 1];
                        return "jd" + s1.split(".html")[0];
                    } else if(url.indexOf("product.suning.com") >= 0){
                        if(url.indexOf("detail") >= 0){
                            var ss1 = url.split("detail_")[1].split(".")[0];
                        } else {
                            var ss = url.split(".html")[0];
                            ss = ss.split("com/")[1];
                            var ss1 = ss.split("/")[0] + '_' + ss.split("/")[1];
                        }
                       return  "publicsuni_" + ss1;
                    } else if(url.indexOf("item.yhd.com") >= 0){
                        var ss = url.split("item/");
                        var ss1 = ss[1].split("?");
                        return "publicyhdi_" + ss1[0];
                    } else if(url.indexOf("gome.com.cn") >= 0){
                        var ss = url.split("cn/");
                        var ss1 = ss[1].split(".");
                        return "publicgome_" + ss1[0];
                    } else {
                        return "";
                    }
            }     
        }
        var arrurl,arrayurl,arrid,id;
        var arrayId = [];
        productcopytask.deliveryTemplates().then(function(templates){
            var newtemplate = {name:"默认运费模板",id:0}
            templates.unshift(newtemplate);
            console.log(templates);
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
        })
        var  URLcheck = "(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?";
        var  test = new RegExp(URLcheck);
        $scope.searchGoods = function () {
            if($scope.copyLink == "" || $scope.copyLink == null){
                layer.msg("请输入宝贝链接");
            }else if(test.test($scope.copyLink)){
                $scope.list = listFactory.$new(productcopy.query);
                $scope.list.filterOptions.numiids = getId($scope.copyLink);
                $scope.list.load();
                $scope.list.addLoadCallback(addItemselect);   
            }else{
                layer.msg("请输入正确宝贝链接");
            }  
        }    
        function  addItemselect() {
            angular.forEach($scope.list.items,function(item){
                if(item.numiid.indexOf("jd") != -1){
                    var id = item.numiid.split("jd");
                    var urlHref = "https://item.jd.com/"+id[1]+".html";
                }
                if(item.numiid.indexOf("alibaba") != -1){
                    var id = item.numiid.split("alibaba");
                    var urlHref = "https://detail.1688.com/offer/"+id[1]+".html?";
                }
                angular.extend(item,item,{
                    "urlHref":urlHref
                })
            })
            $scope.list.items.forEach(function(item){
                angular.extend(item,item,{
                    "itemSelect":false
                })
            })
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
            if(!$scope.cid){
                layer.msg("请选择对应的淘宝分类");
            }else{
                var items = $scope.list.items,
                selectItem = [];
                items.forEach(function(item){
                    if(item.itemSelect == true){
                        selectItem.push(item);
                    }
                });
                console.log(selectItem);
                if(selectItem == null || selectItem == ""){
                    layer.msg("请选择复制商品");
                }else{
                    $scope.subscribeVer = appInfo.get('deadline').itemCode;
                    if($scope.subscribeVer != 'vip2'){
                        if(selectItem.length > 1){
                            // 弹窗提示
                            $rootScope.popBuyLink('恭喜您获得一个红包','仅需5元/月马上体验正式版！','http://tb.cn/jcKqKTx');
                            return;
                        }
                    }
                    var jaStr = JSON.stringify(selectItem);
                    var settingStr = {"ifSku":$scope.ifSku,"ifLink":$scope.ifLink,"autoWapDesc":$scope.autoWapDesc,
                                "shopcatId":$scope.selectSellerCatId,"deliveryId":$scope.selectTemplateId,"picdirId":$scope.selectCategoryId,
                                "priceMultiply":"","priceAdd":"","dPrice":$scope.dPrice,"approveStatus":"instock",
                                "filterDup":$scope.filterDup,"syncGoods":$scope.syncGoods,"cid":$scope.cid,"flipImage":$scope.flipImage,"graphicMode":$scope.graphicMode};  
                    var settingStr = JSON.stringify(settingStr),
                    params = {jaStr:jaStr,settingStr:settingStr},
                    progressparams = {itemStr:jaStr};
                    console.log(settingStr);
                    function  itemProcess(){
                        productcopytask.itemProcess(progressparams).then(function(response){
                            console.log(response);
                            $scope.copyProcessItems = JSON.parse(jaStr);
                            console.log($scope.copyProcessItems);
                            angular.forEach($scope.copyProcessItems,function(a){
                                angular.forEach(response,function(b){
                                    if(b.mark){
                                        if(b.mark.indexOf(";")>0){
                                            var itemarray = b.mark.split(";");
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
                                console.log($scope.copyProcessItems);
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
                                console.log($scope.copyProcessItems);
                                angular.forEach($scope.copyProcessItems,function(item){
                                    switch(item.mark){
                                        case "正在复制中...":item.progressInfo = true;break;
                                        case "等待复制"     :item.progressWarning = true;break;
                                        case "复制成功"     :item.progressSuccess = true;break;
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
                                        copyingArray.push(item);
                                        var copyingArrayTotal = copyingArray.length;
                                        console.log(copyingArrayTotal);
                                        percent = Math.round(copyingArrayTotal / itemTotal * 10000) / 100.00 + "%";
                                        console.log(percent);
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
                                        time = setInterval(itemProcess,1000);
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
                    }
                }; 
})(window.angular);