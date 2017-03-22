(function(angular, undefined) {'use strict';

angular
	.module('ui.steps', [])
	.factory('stepsFactory', stepFactory)
	.directive('stepBar', stepBarDirective)
;

function stepFactory() {
	var f = {
		'$new': createStep
	};
	return f;

	function createStep(options) {
		return new Steps(options);
	}

	function Steps(options) {
		this.items      = [];
		this.options    = angular.isObject(options) ? options : {};
		this.setLables  = setLables;
		this.setCurrent = setCurrent;
		this.refresh    = refresh;
		var steps       = this;

		this.refresh();

		function setLables(labels) {
			this.options.labels = labels;
			return this;
		}

		function setCurrent(stepIndex) {
			this.options.currentStep = stepIndex;
			return this;
		}

		function refresh() {
			if(angular.isUndefined(this.options.labels)) {
				this.options.labels = [];
			}
			if(angular.isUndefined(this.options.currentStep)) {
				this.options.currentStep = 1;
			}
			steps.items = [];
			var options = this.options;
			angular.forEach(options.labels, function(label, i) {
				var step = {label: label, status: 'todo'};
				if(i < options.currentStep - 1) {
					step.status = 'finished';
				}
				if(i == options.currentStep - 1) {
					step.status = 'current';
				}
				steps.items.push(step);
			});
		}
	}
}

function stepBarDirective() {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: '/template/ui/stepBar.tpl.html',
		scope: {
			steps: "="
		}
	};
}

})(window.angular);
