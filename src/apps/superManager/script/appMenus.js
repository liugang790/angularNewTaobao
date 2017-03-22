(function(app) {'use strict';
/**
 * @ngInject
 */
app.config(function(menuManagerProvider, $sceProvider) {
    $sceProvider.enabled(true);
    menuManagerProvider
        .add({
            name        : 'promotionmisc',
            label       : '营销活动',
            level       : 1,
            status      :false,
            order       :0,
            pagePath    : 'member.promotion.promotionmisc.list',
            parentName  : 'root',
            activeRoutes: '/member/promotion/promotionmisc'
        })
        .add({
            name        : 'flowcarefree',
            label       : '流量推广',
            level       : 1,
            order       : 1,
            status      :true,
            parentName  : 'root',
            activeRoutes: '/member/flowcarefree'
        })
            .add({
                name        :'goods',
                label       :'投放宝贝',
                level       :2,
                pagePath    :'member.flowcarefree.goods.mybaby',
                activeRoutes:'/member/flowcarefree/goods',
                parentName  :'flowcarefree'
            })
            .add({
                name        :'advert',
                label       :'投放广告',
                level       :2,
                pagePath    :'member.flowcarefree.advert.advert',
                activeRoutes:'/member/flowcarefree/advert',
                parentName  :'flowcarefree'
            })
            .add({
                name        :'myuser',
                label       :'充值中心',
                level       :2,
                pagePath    :'member.flowcarefree.myuser.vouchercenter',
                activeRoutes:'/member/flowcarefree/myuser',
                parentName  :'flowcarefree'
            })

        .add({
            name        : 'copy',
            label       : '商品复制',
            status      :false,
            level       : 1,
            pagePath    : 'member.product.copy.taobaoandtmall',
            activeRoutes: '/member/product/copy',
            parentName  : 'root'
        })
        .add({
            name        :'phone',
            label       :'手机详情',
            status      :false,
            level       :1,
            pagePath    :'member.product.phone.developphonedetail',
            activeRoutes:'/member/product/phone',
            parentName  :'root'
        })
        .add({
            name        :'stock',
            label       :'库存管理',
            status      :false,
            level       :1,
            pagePath    :'member.product.stock.link',
            activeRoutes:'/member/product/stock',
            parentName  :'root'
        })
        // .add({
        //     name        : 'promotion',
        //     label       : '营销推广',
        //     level       : 1,
        //     order       : 1,
        //     parentName  : 'root',
        //     activeRoutes: '/member/promotion'
        // })
    ;
});
})(angular.module('app'));
