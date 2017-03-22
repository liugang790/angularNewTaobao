(function(angular, undefined){'use strict';

	angular.module('service.activity.product', [])
		.provider('ActivityProduct', productManager);

	var provider;
	function productManager() {
		provider = this;
		this.queryApiName 		= 'activity.product.list';
		this.addApiName 		= 'activity.product.add';
		this.addedApiName 		= 'activity.product.added';
		this.removeAddedApiName = 'activity.product.addedRemove';
		this.updateApiName 		= 'activity.product.update';
		this.deleteApiName 		= 'activity.product.delete';

		this.$get = productService;
	}

	/**
	* @ngInject
	*/
	function productService(apiClient, $http, systemMath) {
		var service = {
			query : query,
			add : add,
			getAdded : getAdded,
			removeAdded : removeAdded,
			update: update,
			deleteProduct: deleteProduct
		};
		return service;

		function query(params) {
			return apiClient.$new(provider.queryApiName).send(params).then(function(response){
				angular.forEach(response.items, function(item){
					item.uniqueId = item.source.typeCode + item.source.wareId;
					item.price = systemMath.pricetFloat(item.price/100);
					item.taobaoUrl = 'http://item.daily.taobao.net/item.htm?id=' + item.source.wareId;
				});
				return response;
			});
		}

		function add(params) {
			return apiClient.$new(provider.addApiName).send(params).then(function(response){
				return response;
			});
		}

		function getAdded(params) {
			return apiClient.$new(provider.addedApiName).send(params).then(function(response){
				return response;
			});
		}

		function removeAdded(params) {
			return apiClient.$new(provider.removeAddedApiName).send(params).then(function(response){
				return response;
			});
		}

		function update(params) {
			return apiClient.$new(provider.updateApiName).send(params).then(function(response){
				return response;
			});
		}

		function deleteProduct(params) {
			return apiClient.$new(provider.deleteApiName).send(params).then(function(response){
				return response;
			});
		}
	}
})(window.angular);