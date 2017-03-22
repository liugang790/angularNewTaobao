(function(angular, undefined){'use strict';

	/**
	* 活动预览指令模块
	*/
	angular
		.module('directives.activityPreview', [])
		.directive('activityPreview', activityPreviewDirective)
		.filter('trusted', trustedFilter)
		.controller('PreviewDirectiveCtrl', PreviewDirectiveCtrl);

	function activityPreviewDirective() {
		return {
			restrict: 'E',
			templateUrl: '/template/ui/activityPreview.tpl.html',
			controller: 'PreviewDirectiveCtrl',
			scope: {
				activity : '=',
				refresh : '='
			}
		};
	}

	/**
	* iframe信任路由过滤器
	* @ngInject
	*/
	function trustedFilter($sce) {
		return function(url) {
			return $sce.trustAsResourceUrl(url);
		}
	}

	/**
	* @ngInject
	* 活动预览指令控制器
	*/
	function PreviewDirectiveCtrl($scope, appConfig) {
		$scope.previewUrl = appConfig.activityUrl + '/activity/' + $scope.activity.id;

		$scope.$watch(function(){return $scope.refresh;}, function(newValue, oldValue){
			if(newValue !== oldValue && newValue !== 0){
				$scope.previewUrl += ('?refresh=' + (new Date()).getTime());
			}
		});
	}

})(window.angular);