(function(angular, undefined) {'use strict';

angular
	.module('sui', [])
	.directive('suiDatepicker', suiDatepicker)
	.directive('suiPagination', suiPagination)
	.directive('suiValidate', suiValidate)
	.directive('suiModalToggle', suiModalToggle)
	.directive('suiTooltip', suiTooltip)
;

function suiDatepicker() {
	return {
		restrict: 'A',
		scope: {
			suiDatepicker: "="
		},
		link: function(scope, element, attr) {
			if(angular.isUndefined(scope.suiDatepicker)) {
				var options = {};
			} else {
				var options = scope.suiDatepicker;
			}
			$(element).datepicker(options);
		}
	};
}


function suiModalToggle($compile) {
	var modalElement;
	var oldValue;
	var timeId;
	var directive = {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attr) {
			element.bind('click', function() {
				if(angular.isUndefined(modalElement) || attr.suiModalTemplateUrl !== oldValue || $('#'+timeId).length === 0) {
					oldValue = attr.suiModalTemplateUrl;
					timeId = (new Date()).getTime();
					var html = '<div id="' + timeId + '" tabindex="-1" role="dialog" data-hasfoot="false" class="sui-modal hide fade">'
						+ '<div ng-include="'+ attr.suiModalTemplateUrl+ '"></div>'
						+'</div>';
					modalElement = angular.element(html);
					element.after(modalElement);
					scope.$apply($compile(modalElement)(scope));
					$(modalElement).modal({backdrop: false});
				}else{
					$(modalElement).modal('show');
				}
			});
		}
	}
	return directive;
}

function suiPagination() {
	return {
		restrict: 'A',
		scope: {
			suiPagination     : "=",
			suiPaginationTotal: "=",
			suiPaginationSize : "="
		},
		link: function(scope, element, attr){
			if(angular.isUndefined(scope.suiPagination)) {
				var options = {};
			}else{
				var options = scope.suiPagination;
			}
			options.itemsCount = scope.suiPaginationTotal;
			options.pageSize = scope.suiPaginationSize;
			scope.$watch('suiPaginationTotal', function(newTotal, oldTotal) {
				if(newTotal === oldTotal) {
					return;
				}
				$(element).pagination('updateItemsCount', newTotal);
			});
			scope.$watch('suiPaginationSize', function(newSize, oldSize) {
				if(newSize === oldSize) {
					return;
				}
				options.pageSize = newSize;
				$(element).pagination('updatePages', Math.ceil(options.itemsCount/options.pageSize));
			});
			$(element).pagination(options);
		}
	};
}

function suiValidate() {
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			$(element).validate();
		}
	}
}

function suiTooltip() {
	return {
		restrict: 'A',
		scope: {
			suiTooltipTitle: "=",
			suiTooltip: "="
		},
		link: function(scope, element, attr){
			if(angular.isObject(scope.suiTooltip)){
				var options = angular.extend({}, scope.suiTooltip);
			}else{
				var options = {};
			}
			if(attr.type) {
				options.type = attr.type;
			}
			options.animation = true;
			options.title = scope.suiTooltipTitle;
			element.tooltip(options);
		}
	}
}

})(window.angular);
