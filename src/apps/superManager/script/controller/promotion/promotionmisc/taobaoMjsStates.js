(function(module, undefined){'use strict';

	/**
	* 淘宝满就送活动路由配置
	*/
	module.config(Configure);

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider
			.state('member.promotion.promotionmisc.taobaomjs', {
				url: '/taobaomjs',
				parent: 'member.promotion.promotionmisc',
				views: {
					"": {
						template: '<div ui-view="taobaomjs"></div>',
						controller: 'TaobaomjsMainCtrl'
					}
				},
				resolve: {
					currentShop: /* @ngInject */function(Context){
						return Context.shop();
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaomjs.create', {
				url: '/create',
				parent: 'member.promotion.promotionmisc.taobaomjs',
				views: {
					'taobaomjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/create.tpl.html',
						controller: 'TaobaomjsCreateCtrl',
						resolve: {
							participateRange: function(){return 1;}
						}
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaomjs.edit', {
				url: '/edit/:activityId',
				parent: 'member.promotion.promotionmisc.taobaomjs',
				views: {
					'taobaomjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/edit.tpl.html',
						controller: 'TaobaomjsEditCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaomjs.restart', {
				url: '/restart/:activityId',
				parent: 'member.promotion.promotionmisc.taobaomjs',
				views: {
					'taobaomjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/create.tpl.html',
						controller: 'TaobaomjsCreateCtrl',
						resolve: {
							participateRange: function(){return 1;}
						}
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaomjs.addproducts', {
				url: '/add-products',
				parent: 'member.promotion.promotionmisc.taobaomjs',
				views: {
					'taobaomjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/products.tpl.html',
						controller: 'TaobaomjsProductsCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.taobaomjs.setdetail', {
				url: '/set-detail',
				parent: 'member.promotion.promotionmisc.taobaomjs',
				views: {
					'taobaomjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/setDetail.tpl.html',
						controller: 'TaobaomjsDetailCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.fullshopmjs', {
				url: '/fullshopmjs',
				parent: 'member.promotion.promotionmisc',
				views: {
					"": {
						template: '<div ui-view="fullshopmjs"></div>',
						controller: 'TaobaomjsMainCtrl'
					}
				},
				resolve: {
					currentShop: /* @ngInject */function(Context){
						return Context.shop();
					}
				}
			})
			.state('member.promotion.promotionmisc.fullshopmjs.create', {
				url: '/create',
				parent: 'member.promotion.promotionmisc.fullshopmjs',
				views: {
					'fullshopmjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/create.tpl.html',
						controller: 'TaobaomjsCreateCtrl',
						resolve: {
							participateRange: function(){return 0;}
						}
					}
				}
			})
			.state('member.promotion.promotionmisc.fullshopmjs.edit', {
				url: '/edit/:activityId',
				parent: 'member.promotion.promotionmisc.fullshopmjs',
				views: {
					'fullshopmjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/edit.tpl.html',
						controller: 'TaobaomjsEditCtrl'
					}
				}
			})
			.state('member.promotion.promotionmisc.fullshopmjs.restart', {
				url: '/restart/:activityId',
				parent: 'member.promotion.promotionmisc.fullshopmjs',
				views: {
					'fullshopmjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/create.tpl.html',
						controller: 'TaobaomjsCreateCtrl',
						resolve: {
							participateRange: function(){return 0;}
						}
					}
				}
			})
			.state('member.promotion.promotionmisc.fullshopmjs.setdetail', {
				url: '/set-detail',
				parent: 'member.promotion.promotionmisc.fullshopmjs',
				views: {
					'fullshopmjs': {
						templateUrl: '/template/promotion/promotionmisc/taobaomjs/setDetail.tpl.html',
						controller: 'TaobaomjsDetailCtrl'
					}
				}
			})
		;
	}
})(window.angular.module('promotionmisc.TaobaoMjs'));