(function(angular, undefined) {'use strict';

	angular
		.module('service.activity.page', [])
		.provider('ActivityPage', activityPageProvider);

	var provider;
	function activityPageProvider() {
		provider = this;

		this.editPageApiName 	= 'activity.page.edit';
		this.getPageApiName 	= 'activity.page.get';
		this.$get = pageFactory;
	}

	/**
	* @ngInject
	*/
	function pageFactory(apiClient) {
		var service = {
			editPage 		: editPage,
			getActivityPage : getActivityPage
		};
		return service;

		function editPage(params)
		{
			return apiClient.$new(provider.editPageApiName).send(params).then(function(response){
				return response;
			});
		}

		function getActivityPage(params)
		{
			return apiClient.$new(provider.getPageApiName).send(params).then(function(response){
				return response;
			});
		}
	}
})(window.angular);