(function(angular, undefined) {'use strict';

/**
 * 九宫格拼图
 */
angular.module('ui.imageJigsaw', [])
	.directive('imageJigsaw', ImageJigsawDirective)
;

function ImageJigsawDirective() {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: '/src/script/ui/imageJigsaw/default.tpl.html',
		controller: ImageJigsawDirectiveCtrl,
		scope: {
			images: "="
		}
	}
}

/**
 * @ngInject
 */
function ImageJigsawDirectiveCtrl($scope) {
	var loop = 9 - $scope.images.length;
	if(loop > 0) {
		for(var i=0; i<loop; i++) {
			$scope.images.push('')
		}
	} else if (loop < 0) {
		$scope.images = $scope.images.splice(0, 9);
	}
}

})(window.angular);
