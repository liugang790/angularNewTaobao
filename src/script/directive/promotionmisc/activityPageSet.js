(function(angular, undefined){'use strict';

    /**
     *活动显示页面设置指令
     */
    angular
        .module('directives.activityPageSet', [])
        .service('activityPageService', activityPageService)
        .directive('activityPageSetting',pageSettingDirective)
        .controller('pageSettingDirectiveCtrl', pageSettingDirectiveCtrl)
        .directive('shareTitle', shareTitle)
        .controller('shareTitleCtrl',shareTitleCtrl)
        .directive('shareTitleImage', shareTitleImage)
        .controller('shareTitleImageCtrl', shareTitleImageCtrl)
        .directive('commentsSetting', commentsSetting)
        .controller('commentsSettingCtrl', commentsSettingCtrl)
        .directive('shareBanner', shareBannerDirective)
        .controller('shareBannerCtrl', shareBannerCtrl)
    ;

    /**
     * 活动显示页面设置指令
     */
    function pageSettingDirective() {
        return {
            restrict: 'E',
            templateUrl: '/template/ui/activityPageSet.tpl.html',
            controller: 'pageSettingDirectiveCtrl',
            transclude : true,
            scope: {
                activity : '=',
                showComments : '='
            }
        };
    }

    /**
     *活动页面设置 分享标题指令
     */
    function shareTitle() {
        return {
            restrict : 'E',
            templateUrl : '/template/ui/shareTitle.tpl.html',
            controller : 'shareTitleCtrl',
            transclude : true,
            scope : {
                activity : '='
            }
        }
    }

    /**
     *活动页面设置 分享标题图片指令
     */
    function shareTitleImage() {
        return {
            restrict : 'E',
            templateUrl : '/template/ui/shareTitleImage.tpl.html',
            controller : 'shareTitleImageCtrl',
            scope : {
                activity : '='
            }
        }
    }

    /**
    * 活动页面设置 分享页活动专题头图选择指令
    */
    function shareBannerDirective() {
        return {
            restrict: 'E',
            templateUrl: '/template/ui/shareBanner.tpl.html',
            controller: 'shareBannerCtrl',
            scope: {
                activity: '='
            }
        }
    }

    /**
     * 活动页面评论设置 指令
     */
    function commentsSetting() {
        return {
            restrict : 'E',
            templateUrl : '/template/ui/commentsSet.tpl.html',
            controller : 'commentsSettingCtrl',
            scope : {
                activity : '='
            }
        }
    }
    /**
     * 活动显示页面指令控制器
     */
    function pageSettingDirectiveCtrl($scope, Activity, activityPageService, ActivityPage)
    {
        var activityEntity = $scope.activity;
        $scope.linstenIsShowScore = linstenIsShowScore;

        $scope.linstenNoScore = linstenNoScore;
        var startDate = new Date(activityEntity.startTime * 1000);

        var endDate = new Date(activityEntity.endTime * 1000);
        var summary = startDate.getFullYear() + '年' + (startDate.getMonth() + 1) + '月' + startDate.getDate() + '日到'
            + endDate.getFullYear() + '年' + (endDate.getMonth() + 1) + '月' + endDate.getDate() + '日'
            + activityEntity.detail.priceTag;
        $scope.activity.page = {
            isShowShopScore : true,
            activityDesc : summary + '！快来抢购！',
            shareTitle   : summary,
            comments     : []
        }

        ActivityPage.getActivityPage({id: activityEntity.id}).then(function (page) {
            if(page === null){
                $scope.activity.page.isShowShopScore = true;
                return ;
            }
            $scope.activity.page = page;
            activityPageService.setCurrentCommentsLength($scope.activity.page.comments.length);
        }, function (error) {
            $scope.errorMessage = error.errorMessage;
        });

        function linstenIsShowScore(activity)
        {
            $scope.noShow = !activity.isShowShopScore;
        }
        function linstenNoScore(activity) {
            activity.isShowShopScore = !$scope.noShow;
        }

    }

    /**
     * 活动显示页面 分享标题指令控制器
     */
    function shareTitleCtrl($scope, activityPageService)
    {
        $scope.titles = activityPageService.getTitles();
        $scope.selectedTitle = selectedTitle;
        function selectedTitle(title) {
            $scope.selectTitle = !$scope.selectTitle;
            $scope.activity.page.shareTitle = title;
        }

    }

    /**
    * @ngInject
    * 活动页面设置 专题头图选择控制器
    */
    function shareBannerCtrl($scope, activityPageService, $compile) {
        $scope.bannerImages = activityPageService.getBannerImages();
        $scope.selectBanner = selectBanner;

        $scope.$watch(function(){return $scope.activity.page.bannerCode}, function(newValue, oldValue){
            if(newValue !== oldValue && newValue!==undefined) {
                $scope.selectedBanner = $scope.bannerImages.filter(function(value){
                    return value.code === $scope.activity.page.bannerCode;
                })[0];
            }
        });

        $scope.selectBannerStatus = false;
        function selectBanner() {
            $scope.selectBannerStatus = !$scope.selectBannerStatus;
        }

        $scope.categories = [];
        var cate = [];

        $scope.bannerImages.forEach(function(banner){
            if(cate.indexOf(banner.cateCode) === -1) {
                cate.push(banner.cateCode);
                $scope.categories.push({code: banner.cateCode, name: banner.cateName});
            }
        });
        $scope.selectCate = 'discount';
        $scope.cateName = '促销';

        $scope.select = function(banner) {
            $scope.selectedBanner = banner;
            $scope.activity.page.bannerCode = $scope.selectedBanner.code;
            $scope.activity.page.bannerSrc = $scope.selectedBanner.src;
        }
        $scope.selectCategory = function(category) {
            $scope.selectCate=category.code;
            $scope.cateName=category.name
        }
    }

    /**
     * 活动显示页面 分享标题图片指令控制器
     */
    function shareTitleImageCtrl($scope, activityPageService, ActivityProduct)
    {
        $scope.titleImages = activityPageService.getTitleImages();
        $scope.imageMore = imageMore;

        $scope.imageformMessage = '图片来自商品';
        ActivityProduct.getAdded({id:$scope.activity.id,page:1,pageSize:10}).then(function(products){
            //判断是否有商品
            if(angular.isArray(products.items) && products.items.length === 0){
                $scope.defaultImg = $scope.titleImages.default[0];
            }else{
                $scope.defaultImg = products.items[0].picUrl;
            }
            //保存的商品
            if($scope.activity.page.titleImage){
                $scope.imageformMessage = '图片来自素材库';
                $scope.defaultImg = $scope.activity.page.titleImage;
            }
            //图片来源于商品
            var images = [];
            angular.forEach(products.items, function (product) {
                images.push(product.picUrl);
            });
            //剔除重复--
            $scope.titleImages.product = images;
        });

        function imageMore(img, type) {
            switch(type){
                case 'default' : $scope.imageformMessage = '图片来自素材库';
                    break;
                case 'product' :  $scope.imageformMessage = "图片来自商品";
                    break;
                default :
                    $scope.imageformMessage = '请选择图片';
            }
            // $scope.showTitleImage = !$scope.showTitleImage; //点击后是否隐藏选择box
            $scope.activity.page.titleImage = $scope.defaultImg = img;
        }
    }

    /**
     * 活动页面 评论设置指令控制器
     */
    function commentsSettingCtrl($scope, activityPageService)
    {
        $scope.appendNext = appendNext;
        $scope.closeCurrent = closeCurrent;
        var maxLength = 3;

        //删除评论
        function closeCurrent($index) {
            $scope.commentsMsg = '';
            var currentLength = activityPageService.getCurrentCommentsLength();
            if(currentLength <= maxLength && currentLength >=0){
                $scope.activity.page.comments.splice($index,1);
                activityPageService.setCurrentCommentsLength(--currentLength);
            }
        }
        //添加评论
        function appendNext() {
            var currentLength = activityPageService.getCurrentCommentsLength();
            if(currentLength < maxLength && currentLength >=0){
                var comments =  $scope.activity.page.comments;
                var newComment = activityPageService.getRandComment(comments);
                $scope.activity.page.comments = comments.concat(newComment);
                activityPageService.setCurrentCommentsLength(++currentLength);
            }else{
                $scope.commentsMsg = "已经添加到上限";
            }
        }
    }

    function activityPageService($location, systemMath)
    {
        this.currentCommentsLength = 0 ;
        this.titles = [
            '千万别点开,点开你就走远了...',
            '我的价格让你心动,我的质量让你闭嘴.',
            '打折那就狠一点,一不做二不休,第二名可是头号输家.',
            '清仓处理换工资',
            '来了一次,再来一次',
            '隔壁老王,来我店里做了...'
        ];
        var imageHost = $location.protocol() + '://' + $location.host();
        this.randComments = [
            {anonymous : true, name :'心***悦',content:'东西非常不错,卖家服务也很好'},
            {anonymous : true, name: 's***8', content: '东西非常不错，卖家服务也'},
            {anonymous : true, name :'千***伴',content: '质量很好,没有失望,样子也喜欢,好评'},
            {anonymous : true, name :'卧***样',content: '重要的事情说三遍,物超所值,物超所值,物超所值'},
            {anonymous : true, name: '一***止', content:'质量很好，没有失望，样子也喜欢，好评!'},
            {anonymous : true, name: '浩***n', content: '质量不错！穿着舒服～～好喜欢～'},
            {anonymous : true, name: '妹***悦', content: '棒棒的，每次买都没有失望过。'},
            {anonymous : true, name: '笼***蕉', content: '已收到，和照片一样很好看，非常适合自己'},
            {anonymous : true, name: 'c***鞋', content: '朋友说很漂亮，大小正好，质量也不错。'},
            {anonymous : true, name: '千***魅', content: '好看好看好看！重要的事情说三遍，质量也不错，物超所值哦'},
            {anonymous : true, name: '卧***样', content: '非常赞\(≧▽≦)/很合适自己，就喜欢这样的!'},
            {anonymous : true, name: '梁***0', content: '收到了，各方面都很好，服务好，速度也快，特别感谢'},
            {anonymous : true, name: '黄***瑰', content: '在这里买了很多次，从来没有失望过，非常喜欢！！！'}
        ];
        this.titleImages = {
            'default' : [
                imageHost + '/image/share/default_01.jpg',
                imageHost + '/image/share/default_02.jpg',
                imageHost + '/image/share/default_03.jpg',
                imageHost + '/image/share/default_04.jpg',
                imageHost + '/image/share/default_05.jpg'
            ]
        };
        this.bannerImages = [
            {code: 'discount_1', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2ncy7axvzQeBjSZFKXXXgXFXa-361904057.png'},
            {code: 'discount_2', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2U9raaBPzQeBjSZFLXXa3cXXa-361904057.png'},
            {code: 'discount_3', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2SSm5ap95V1Bjy0FlXXaBbXXa-361904057.png'},
            {code: 'discount_4', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2UnmZaqi5V1Bjy1zkXXcL4VXa-361904057.jpg'},
            {code: 'discount_5', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2Ukq5aqi5V1BjSspaXXbrApXa-361904057.png'},
            {code: 'discount_6', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2nqK0aqa5V1Bjy0FaXXaXvpXa-361904057.jpg'},
            {code: 'discount_7', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2Ini4ap15V1Bjy1XaXXaPqVXa-361904057.png'},
            {code: 'discount_8', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2CKe5aqm5V1Bjy1zbXXXsBFXa-361904057.png'},
            {code: 'discount_9', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2KDG6ap55V1Bjy0FpXXXhDpXa-361904057.png'},
            {code: 'discount_10', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2dIW3aqi5V1BjSspfXXapiXXa-361904057.jpg'},
            {code: 'discount_11', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB22Rq_ap_AQeBjSZFyXXb1bXXa-361904057.png'},
            {code: 'discount_12', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2x_yZaqi5V1Bjy1zkXXcL4VXa-361904057.png'},
            {code: 'discount_13', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2zQm6ap15V1Bjy1XbXXaNcVXa-361904057.png'},
            {code: 'discount_14', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2tsK3aqm5V1Bjy1zeXXcTCFXa-361904057.png'},
            {code: 'discount_15', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2W0e2aqi5V1BjSszdXXXUJXXa-361904057.png'},
            {code: 'discount_16', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2nDGZaqi5V1Bjy1zkXXcL4VXa-361904057.jpg'},
            {code: 'discount_17', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2XVqZap15V1Bjy1XdXXayCFXa-361904057.png'},
            {code: 'discount_18', cateCode: 'discount', cateName: '促销', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2_051aqm5V1BjSszfXXXjxXXa-361904057.png'},
            {code: 'festival_1', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2TdG2aqm5V1BjSsziXXaZMpXa-361904057.jpg'},
            {code: 'festival_2', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2kvS.aBPzQeBjSZPiXXb0TpXa-361904057.jpg'},
            {code: 'festival_3', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2oqy4aqi5V1BjSspcXXcSrFXa-361904057.jpg'},
            {code: 'festival_4', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2f8O6aurAQeBjSZFwXXa_RpXa-361904057.jpg'},
            {code: 'festival_5', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2R5K9ap_AQeBjSZFtXXbFBVXa-361904057.jpg'},
            {code: 'festival_6', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2DOa9apHzQeBjSZFHXXbwZpXa-361904057.jpg'},
            {code: 'festival_7', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB20Ca8apHzQeBjSZFsXXbGvXXa-361904057.jpg'},
            {code: 'festival_8', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2sae7aqi5V1BjSspeXXcWPFXa-361904057.jpg'},
            {code: 'festival_9', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2WGG4aqi5V1BjSspcXXcSrFXa-361904057.jpg'},
            {code: 'festival_10', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2DUC6ap55V1Bjy0FpXXXhDpXa-361904057.jpg'},
            {code: 'festival_11', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2Uu12aqi5V1BjSsplXXaVYpXa-361904057.png'},
            {code: 'festival_12', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2uOO5aqm5V1BjSsppXXcMCVXa-361904057.jpg'},
            {code: 'festival_13', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2mxK2aqi5V1BjSsphXXaEpXXa-361904057.jpg'},
            {code: 'festival_14', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2W8u5aqi5V1BjSspaXXbrApXa-361904057.png'},
            {code: 'festival_15', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB24J58aqm5V1BjSszhXXcMtXXa-361904057.jpg'},
            {code: 'festival_16', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2N0W5aqi5V1BjSspmXXXlwpXa-361904057.jpg'},
            {code: 'festival_17', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2QFW6ap55V1Bjy0FnXXc5XFXa-361904057.jpg'},
            {code: 'festival_18', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2quO.ap55V1Bjy0FoXXbVjFXa-361904057.jpg'},
            {code: 'festival_19', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2Cy15aqm5V1BjSsppXXcMCVXa-361904057.jpg'},
            {code: 'festival_20', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB24vnXapHzQeBjSZFuXXanUpXa-361904057.png'},
            {code: 'festival_21', cateCode: 'festival', cateName: '节日', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2O8W6aurAQeBjSZFwXXa_RpXa-361904057.jpg'},
            {code: 'new_1', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2xLS5aqm5V1Bjy1zbXXXsBFXa-361904057.jpg'},
            {code: 'new_2', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2pSy2aqi5V1Bjy1zdXXaRkVXa-361904057.jpg'},
            {code: 'new_3', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2._O5aqi5V1BjSszbXXb0hVXa-361904057.jpg'},
            {code: 'new_4', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB27US0aqe5V1BjSspkXXcoqpXa-361904057.jpg'},
            {code: 'new_5', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2Ise5apHzQeBjSZFOXXcM9FXa-361904057.jpg'},
            {code: 'new_6', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i4/361904057/TB2GY5_axvzQeBjSZFEXXbYEpXa-361904057.jpg'},
            {code: 'new_7', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i3/361904057/TB2Z3mRXXPcZ1BjSZFlXXb3PVXa-361904057.jpg'},
            {code: 'new_8', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i1/361904057/TB2g6y5axvzQeBjSZFqXXXN5VXa-361904057.jpg'},
            {code: 'new_9', cateCode: 'new', cateName: '上新', src: 'https://img.alicdn.com/imgextra/i2/361904057/TB2EM59aBPzQeBjSZFhXXbRpFXa-361904057.jpg'}
        ];
        this.getTitles = function () {
            return this.titles;
        };
        this.getTitleImages = function () {
            return this.titleImages;
        };
        this.getBannerImages = function() {
            return this.bannerImages;
        }
        //随机产生一个 push 到 currentComments;
        this.getRandComment = function (currentComments) {
            var defaultLength = this.randComments.length;
            var index = systemMath.getRandomInt(0, defaultLength);
            var newComment =  this.randComments[index];
            //递归实现产生随机且不相同
            if(uniqueObjInArray(currentComments, newComment)){
                return newComment;
            }else{
                return this.getRandComment(currentComments);
            }
        };
        this.getCurrentCommentsLength = function(){
            return this.currentCommentsLength;
        };
        this.setCurrentCommentsLength = function(length){
            this.currentCommentsLength = length;
        };

        function uniqueObjInArray(aryOrigin, obj) {
            for (var i=0;i<aryOrigin.length; i++){
                if(JSON.stringify(aryOrigin[i]) === JSON.stringify(obj)){
                    return false;
                }
            }
            return true;
        }
    }
})(window.angular);