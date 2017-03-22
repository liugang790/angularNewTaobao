(function(window, angular, undefined) {'use strict';

/**
 * ngdoc module
 * @name zkf.api
 * @description 提供与接口调用相关的服务
 */
angular
    .module('system.api', [])
    .provider('apiInterceptor', ApiInterceptorProvider);

/**
 * ngdoc provider
 * @name zkfApiInterceptor
 * @description
 * api请求拦截器
 * 在请求发起前检查当前请求是否为api请求，如果是则替换请求的网关和数据交互格式信息。
 * 在请求返回的时候检查请求返回结果是否成功
 */
function ApiInterceptorProvider() {

    this.gateway      = '/rest/'; // 接口网关
    this.dataType     = 'json'; // 掊口交互数据格式
    this.apiPrefix    = '/restApi/'; // 接口地址标识，只有以这个标识开头的请求地址才会被认为是接口请求
    this.zhikrApiHost  = 'super.7ingu.com';
    this.basePostData = {}; // 每次发起post请求都需要添加的基础请求参数

    this.$get = ApiInterceptorFactory;

    var provider = this;
    var prefixReg = new RegExp('^' + provider.apiPrefix);

    ApiInterceptorFactory.$inject = ['$q'];
    function ApiInterceptorFactory($q) {
        var interceptor = {
            isApiRequest  : isApiRequest,
            isZhikrRequest: isZhikrRequest,
            request       : request,
            response      : response,
            responseError : responseError
        };
        return interceptor;

        function request(config) {
            if(interceptor.isZhikrRequest(config.url)) {
                config.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
                config.transformRequest = function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                };
                return config;
            }
            if(!interceptor.isApiRequest(config.url)&& !interceptor.isZhikrRequest(config.url)) {
                return config;
            }

            if(config.method === 'POST') {
                if(!angular.isObject(config.data)) {
                    config.data = {};
                }
                angular.extend(config.data, provider.basePostData);
            }

            config.withCredentials = true;
            config.url = config.url.replace(prefixReg, provider.gateway)
                + '.' + provider.dataType;
            return config;
        }

        function response(response) {
            var isJson = response.headers()['content-type'] == 'application/json; charset=utf-8';
            if(isJson && response.data['code'] == 'failure') {
                return $q.reject(response);
            }
            return response;
        }

        function responseError(response) {
            if(response.data == null || angular.isUndefined(response.data['errorMessage'])) {
                if(!angular.isObject(response.data)) {
                    response.data = {
                        code: 'failure'
                    };
                }
                response.data.errorMessage = '网络故障，请确认您已连接互联网';
            }
            return $q.reject(response);
        }

        function isApiRequest(url) {
            return prefixReg.test(url);
        }

        function isZhikrRequest(url) {
            return (url.indexOf(provider.zhikrApiHost) !== -1);
        }
    }
}

})(window, window.angular);
