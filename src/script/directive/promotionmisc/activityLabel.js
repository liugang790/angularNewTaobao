(function(angular, undefined){'use strict';

	/**
	* 活动列表指令集合
	*/
	angular
		.module('directives.activityLabel', [])
		.constant('typeOptions', [
			{code: 'taobaoitem', name:'全店商品打折/减价'},
			{code: 'taobaocommonitem', name: '部分商品打折/减价'},
			{code: 'taobaomjs', name: '部分商品满就送减'}
		])
		.constant('shareTags', [
			{code: 'shareToWeitao', name: '已分享到微淘'},
			{code: 'shareToWeibo', name: '已分享到微博'}
		])
		.directive('activityLabel', activityLabelDirective)
		.controller('ActivityLabelCtrl', ActivityLabelCtrl);

	/**
	* 活动标签指令
	*/
	function activityLabelDirective() {
		return {
			restrict: 'E',
			templateUrl: '/template/activity/activityLabel.tpl.html',
			controller: 'ActivityLabelCtrl',
			transclude: true,
			scope: {
				activity : "="
			}
		};
	}

	/**
	* 活动标签指令控制器
	* @ngInject
	*/
	function ActivityLabelCtrl($scope, typeOptions, TaobaoitemService, shareTags) {
		$scope.shareTags = shareTags;
		$scope.tags = [];
		$scope.activity.posterStatus = false;

		$scope.getTypeName 	= getTypeName;

		if($scope.activity.tags.indexOf('insertPoster') !== -1) {
			$scope.activity.posterStatus = true;
		}
		getTypeName();
		getShareTagName();

		function getTypeName() {
			angular.forEach(typeOptions, function(type){
				if(type.code === $scope.activity.typeCode){
					$scope.typeName = type.name;
					if(type.code === 'taobaoitem' && $scope.activity.participateRangeCode === 'partProduct'){
						$scope.typeName = '部分商品打折/减价';
					}
					if(type.code === 'taobaomjs' && $scope.activity.participateRangeCode === 'fullShop'){
						$scope.typeName = '全店商品满就送减';
					}
				}
			});
		}

		function getShareTagName() {
			angular.forEach($scope.shareTags, function(tag){
				if($scope.activity.tags.indexOf(tag.code) !== -1){
					$scope.tags.push(tag);
				}
			});
		}
	}
})(window.angular);