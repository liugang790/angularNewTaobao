(function(window, angular, undefined) {'use strict';

/**
 * ngdoc module
 * @name zkf.api
 * @description 提供与接口调用相关的服务
 */
angular
    .module('system.api.v2', [])
    .provider('apiClient', ApiClientProvider)
;

var apiClientProvider;

/**
 * @ngdoc provider
 * @name apiClientProvider
 * @description 提供对2.0版api接口的配置管理
 *              主要需要配置的是gateway参数，参数格式为http://{serviceHost}/api.v2.json
 *              未来可能还会有更多参数，比如：appKey
 */
function ApiClientProvider() {
    apiClientProvider = this;
    this.$get         = ApiClient;
    this.gateway      = '/api/v2.json';
    this.apis         = {}
}

/**
 * ## 使用方法
 *
 * **通过接口名称创建接口并请求**
 *
 * apiClient.$new(apiName).send(apiParams).then(successHandle, failureHandle);
 *
 * **通过接口配置创建接口并请求**
 *
 * var apiConfig = {
 * 		method: apiName,
 * 		cache: true
 * }
 * apiConfig.$new(apiConfig).send(apiParams).then(successHandle, failureHandle);
 *
 * @ngInject
 * @ngdoc factory
 * @name apiClient
 * @description 提供2.0版接口的客户端，主要用于创建接口请求对象
 */
function ApiClient($http, $q) {
    var apiClient = {
        $new: createApi
    };
    return apiClient;

    function createApi(config) {
        if(angular.isString(config)) {
            config = {
                method: config
            };
        }
        return new Api(config);
    }

    function Api(config) {
        var api      = this;
        this.send    = send;
        this.$config = config;

        validConfig();

        function send(params) {
            if(!angular.isObject(params)) {
                params = {}
            }

            var sendDefer = $q.defer();
            var httpConfig = {
                url   : apiClientProvider.gateway,
                method: "POST",
                cache : api.$config.cache,
                params: {method:api.$config.method},
                data  : params
            };
            $http(httpConfig).then(function(response) {
                sendDefer.resolve(response.data.data);
            }, function(response) {
                sendDefer.reject(response.data);
            });

            return sendDefer.promise;
        }

        function validConfig() {
            if(!angular.isObject(api.$config)) {
                throw '接口配置数据类型错误';
            }
            if(angular.isUndefined(api.$config['method'])) {
                throw '接口方法名称不能为空'
            }
        }
    }
}

})(window, window.angular);
