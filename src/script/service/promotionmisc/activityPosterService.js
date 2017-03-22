(function(angular, undefined){'use strict';

	angular
		.module('service.activity.poster', [])
		.provider('ActivityPoster', ActivityPosterProvider);

	var provider;
	function ActivityPosterProvider() {
		provider = this;
		this.createApiName 	= 'activity.poster.setting';
		this.clearApiName 	= 'activity.poster.clear';
		this.queryApiName 	= 'activity.poster.get';
		this.getAreaApiName = 'shop.areas.get';
		this.$get = postFactory;
	}
	/**
	* @ngInject
	*/
	function postFactory($templateCache, $compile, $timeout, $q, apiClient, $templateRequest) {
		var service = {
			compileTemp : compileTemp,
			createPoster: createPoster,
			clearPoster : clearPoster,
			queryPoster : queryPoster, 
			getAreas 	: getAreas
		};
		return service;

		function createPoster(params) {
			return apiClient.$new(provider.createApiName).send(params).then(function(response){
				return response;
			});
		}

		function compileTemp(tplName, data) {
			var deferred = $q.defer();
			$templateRequest(tplName).then(function(tpl){
				var ele = angular.element('<div>');
				var template = $compile(tpl)(data);
				ele.append(angular.element(template));  
				var elenodes = $compile(ele)(data);
				return $timeout(function() {
		            var htmlString = '';
		            for(var i=0; i<elenodes.length; i++) {
		                htmlString += elenodes[i].outerHTML ? elenodes[i].outerHTML : elenodes[i].textContent;
		            }
		            htmlString = htmlString.replace(/ng-[a-zA-Z0-9]+/gm, '');
		            deferred.resolve(htmlString);
		        }, 0);
			});
			return deferred.promise;
		}

		function clearPoster(params) {
			return apiClient.$new(provider.clearApiName).send(params).then(function(response){
				return response;
			});
		}

		function  queryPoster(params) {
			return apiClient.$new(provider.queryApiName).send(params).then(function(response){
				return response;
			});
		}
		function getAreas(params) {
            var result = [];
            return apiClient.$new(provider.getAreaApiName).send(params).then(function(response){
                angular.forEach(response.areas, function(value){
                    if(angular.isUndefined(result[value.regionCode])) {
                        result[value.regionCode] = {
                            name: value.regionName,
                            provinces: [{code: value.areaCode, name: value.areaName}]
                        };
                    }else {
                        result[value.regionCode].provinces.push({code: value.areaCode, name: value.areaName});
                    }
               	});
                return result;
            });
        }
	}
})(window.angular);