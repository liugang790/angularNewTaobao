(function(angular, undefined){'use strict';

	angular.module('service.activity.base', [])
		.provider('Activity', ActivityProvider);

	var activityProvider;
	function ActivityProvider() {
		activityProvider = this;

		this.types = [
			{code: 'taobaoitem', name:'全店商品打折/减价'},
			{code: 'taobaocommonitem', name: '部分商品打折/减价'},
			{code: 'taobaomjs', name: '商品满就送减'}
		];

		this.createApiName 	= 'activity.create';
		this.listApiName 	= 'activity.list';
		this.getApiName 	= 'activity.get';
		this.changeApiName  = 'activity.change';
		this.closeApiName 	= 'activity.close';
		this.shareApiName 	= 'activity.share';
		this.deleteApiName  = 'activity.delete';
		this.restartApiName = 'activity.restart';
		this.$get = ActivityFactory;
	}

	/**
	* ngdoc factory
	* 活动服务工厂
	* @ngInject
	*/
	function ActivityFactory(apiClient, systemMath, $q, $filter, appConfig, StorageFactory, $rootScope) {
		var service = {
			upsertActivity 	: upsertActivity,
			query 			: query,
			getActivity 	: getActivity,
			closeActivity 	: closeActivity,
			shareActivity 	: shareActivity,
			deleteActivity	: deleteActivity,
			restartActivity : restartActivity
		};
		return service;
		
		function upsertActivity(params) {
			var defer = $q.defer();
			if(!angular.isUndefined(params.id) && params.id !== '' && params.id !== null){
				params.activityId = params.id;
				return apiClient.$new(activityProvider.changeApiName).send(params).then(function(response){
					return response;
				});
			}else{
				return apiClient.$new(activityProvider.createApiName).send(params).then(function(response){
					if(angular.isUndefined(response.detail.taobaoActivityId) || response.detail.taobaoActivityId === '') {
						defer.reject({
							error: { errorMessage: '创建活动失败'}
						});
					}else {
						defer.resolve(response);
					}
					return defer.promise;
				});
			}

		}

		function query(params) {
			return apiClient.$new(activityProvider.listApiName).send(params).then(function(response){
				var items = [];
				angular.forEach(response.items, function(activity){
					var dt = new Date();
					if(activity.startTime > systemMath.convertToTime(dt)){
						activity.statusName = '未开始';
					}
					if(activity.startTime < systemMath.convertToTime(dt) && activity.endTime > systemMath.convertToTime(dt)){
						activity.statusName = '进行中';
					}
					if(activity.endTime < systemMath.convertToTime(dt) || activity.status === 'close') {
						activity.statusName = '已结束';
					}
					activity.timeLeft = systemMath.timeLeft(activity.endTime);
					items.push(new ActivityEntity(activity));
				});
				response.items = items;
				return response;
			});
		}

		function getActivity(params) {
			return apiClient.$new(activityProvider.getApiName).send(params).then(function(response){
				return new ActivityEntity(response);
			});
		}

		function closeActivity(params) {
			return apiClient.$new(activityProvider.closeApiName).send(params).then(function(response){
				return response;
			});
		}

		function shareActivity(params){
			return apiClient.$new(activityProvider.shareApiName).send(params).then(function(response){
				return response;
			});
		}

		function deleteActivity(params){
			return apiClient.$new(activityProvider.deleteApiName).send(params).then(function(response){
				return response;
			});
		}

		function restartActivity(params) {
			return apiClient.$new(activityProvider.restartApiName).send(params).then(function(response){
				return response;
			});
		}

		/**
		 * 定义活动实体
		 */
		function ActivityEntity($data) {

			angular.extend(this, $data);

			var activityType;

			this.previewUrl = function(source) {
				var url = appConfig.activityUrl;
				// if(source == 'weixin'){
				// 	url = 'http://hyzb.ews.m.jaeapp.com/share.php';
				// }
				// url += '/activity/' + this.id + '/' + source;
				url += '/share.php/activity/' + this.id + '/' + source;
				return url;
			}

			/**
			 * 返回当前活动是否已经结束
			 */
			this.isClosed = function() {
				return (this.status === 'close' || this.endTime < systemMath.convertToTime(new Date()));
			}

			/**
			 * 是否是全店商品参与的活动
			 */
			this.isFullShop = function() {
				return (this.participateRangeCode === 'fullShop');
			}

			/**
			 * 是否已分享微淘
			 */
			this.isShareToWeitao = function() {
				return this.hasTag('shareToWeitao');
			}

			/**
			 * 是否已添加海报
			 */
			this.isInsertPoster = function() {
				return this.hasTag('insertPoster');
			}

			this.hasTag = function(tag) {
				if(!angular.isArray(this.tags)) {
					return false;
				}
				return (this.tags.indexOf(tag) !== -1);
			}

			/**
			 * 返回当前活动的类型名称
			 */
			this.getTypeName = function() {
				if(angular.isUndefined(activityType)) {
					var t = $filter('filter')(activityProvider.types, {code:this.typeCode});
					if(t.length < 0) {
						activityType = '未知活动类型';
						return activityType;
					}
					activityType = t[0].name;
					if(this.typeCode === 'taobaomjs') {
						if(this.participateRangeCode === 'fullShop') {
							activityType = '全店' + activityType;
						} else {
							activityType = '部分' + activityType;
						}
					}
				}
				return activityType;
			}
		}
	}

})(window.angular);