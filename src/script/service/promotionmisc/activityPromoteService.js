(function(angular, undefined){'use strict';

	angular
		.module('service.activity.promote', [])
		.provider('ActivityPromote', activityPromoteProvider)
	;

	var provider;
	function activityPromoteProvider() {
		this.unionSetApiName = 'ad.union.setting';
		this.unionInfoApiName = 'ad.union.info';

		provider = this;
		this.$get = factory;
	}

	/**
	* @ngInject
	*/
	function factory(apiClient) {
		return {
			unionSet: unionSet,
			unionInfo: unionInfo
		};

		function unionSet(params) {
			return apiClient.$new(provider.unionSetApiName).send(params).then(function(response){
				return response;
			});
		}

		function unionInfo(params) {
			return apiClient.$new(provider.unionInfoApiName).send(params).then(function(response){
				return response;
			});
		}
	}

})(window.angular);