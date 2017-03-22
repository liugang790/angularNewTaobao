(function(window, angular, undefined) {'use strict';

/**
 * ngdoc module
 * @name user.auth
 * @description 提供对系统当前会话用户的管理
 */
angular
    .module('user.auth', ['ngCookies'])
    .provider('authCookieStore', CookieStoreProvider)
    .provider('authServerStore', ServerStoreProvider)
    .provider('authBaseAdapter', BaseAdapterProvider)
    .provider('auth', AuthProvider)
    .service('authInterceptor', AuthInterceptor);

var authProvider;


/**
 * ngdoc provider
 * @name zkfAuthProvider
 * @description
 *
 * 当前会话管理服务，由store和adapter两部分组成。
 *
 * store负责会话用户信息的存储，可以在系统配置阶段通过设置zkfAuthProvider的store属性指定
 * 系统将要使用的store服务名称，默认为zkfAuthCookieStore。
 *
 * adapter负责具体的会话授权操作，可以在系统配置阶段通过设置zkfAuthProvider的adapter属
 * 性指定。每一个auth adapter都必须实现一个auth方法以实现具体授权操作。
 */
function AuthProvider() {
    this.adapter = 'authBaseAdapter';
    this.store   = 'authCookieStore';
    this.$get    = AuthFactory;

    authProvider = this;
}

function AuthFactory($injector, $q) {

    var currentAdapter = $injector.get(authProvider.adapter);
    var currentStore = $injector.get(authProvider.store);
    var auth = {
        getAdapter : getAdapter,
        setAdapter : setAdapter,
        getStore   : getStore,
        setStore   : setStore,
        isAuth     : isAuth,
        auth       : auth,
        currentUser: currentUser,
        clear      : clear,
    };

    instanceOfAdapterInterface(currentAdapter);
    instanceOfStoreInterface(currentStore);

    return auth;

    function getAdapter() {
        return currentAdapter;
    }

    function setAdapter(adapter) {
        instanceOfAdapterInterface(adapter);
        currentAdapter = adapter;
        return auth;
    }

    function getStore() {
        return currentStore;
    }

    function setStore(store) {
        instanceOfStoreInterface(store);
        currentStore = store;
        return auth;
    }

    function currentUser(options) {
        return auth.getStore().read(options);
    }

    function isAuth() {
        return auth.getStore().read();
    }

    function auth() {
        var defer = $q.defer();
        auth.getAdapter().auth().then(function(data) {
            auth.getStore().write(data).then(function() {
                defer.resolve(data);
            }, function(response) {
                defer.reject(response);
            });
        }, function(response) {
            defer.reject(response);
        });
        return defer.promise;
    }

    function clear() {
        return auth.getStore().clear();
    }
}

/**
 * ngdoc provider
 * @name zkfAuthCookieStoreProvider
 */
function CookieStoreProvider() {
    this.cookieKey = 'zkfcookie';
    this.$get = StoreFactory;

    var provider = this;

    /**
     * @ngInject
     */
    function StoreFactory($cookieStore, $q) {
        var store = {
            empty: empty,
            read : read,
            write: write,
            clear: clear
        };
        return store;

        function empty() {
            var defer = $q.defer();
            store.read().then(function() {
                defer.reject();
            }, function() {
                defer.resolve();
            })
            return defer.promise;
        }

        function read() {
            var defer = $q.defer();
            var data = $cookieStore.get(provider.cookieKey);
            if(!angular.isUndefined(data)) {
                defer.resolve(data);
            } else {
                defer.reject(data);
            }
            return defer.promise;
        }

        function write(data) {
            $cookieStore.put(provider.cookieKey, data);
            return store.read();
        }

        function clear() {
            $cookieStore.remove(provider.cookieKey);
            return store.empty();
        }
    }
}

function ServerStoreProvider() {
    this.infoApiConfig = {
        url: '/restApi/user/info',
        cache: true,
        method: 'GET'
    };
    this.logoutApiConfig = {
        url: '/restApi/user/logout',
        method: 'POST'
    };
    this.$get = StoreFactory;

    var provider = this;

    /**
     * @ngInject
     */
    function StoreFactory($http, $q) {
        var store = {
            empty: empty,
            read: read,
            write: write,
            clear: clear
        };
        return store;

        function empty() {
            var defer = $q.defer();
            read().then(function() {
                defer.reject();
            }, function() {
                defer.resolve();
            })
            return defer;
        }

        function read(config) {
            if(angular.isObject(config)) {
                var httpConfig = angular.extend(provider.infoApiConfig, config);
            } else {
                var httpConfig = provider.infoApiConfig;
            }
            return $http(httpConfig).then(function(response) {
                provider.infoApiConfig.cache = true;
                return response.data.data.user;
            });
        }

        function write() {
            provider.infoApiConfig.cache = false;
            return read();
        }

        function clear() {
            provider.infoApiConfig.cache = false;
            return $http(provider.logoutApiConfig);
        }
    }
}

function BaseAdapterProvider() {
    this.httpConfig = {
        url   : '/restApi/user/login',
        method: 'POST',
        data  : {},
        params: {}
    };
    this.$get    = AdapterFactory;

    var provider = this;

    AdapterFactory.$inject = ['$http', 'StorageFactory'];
    /**
     * @ngInject
     */
    function AdapterFactory($http, StorageFactory) {
        var adapter = {
            auth: auth,
            getData: getData,
            setData: setData,
            getParams: getParams,
            setParams: setParams
        };
        var $cache = StorageFactory.$new('baseAuthAdapter');
        return adapter;

        function getData() {
            if($cache.has('postData')) {
                angular.extend(provider.httpConfig.data, $cache.get('postData'));
            }
            return provider.httpConfig.data;
        }

        function setData(data) {
            provider.httpConfig.data = data;
            $cache.put('postData', provider.httpConfig.data);
            return adapter;
        }

        function getParams() {
            return provider.httpConfig.params;
        }

        function setParams(params) {
            provider.httpConfig.params = params;
            return adapter;
        }

        function auth() {
            return $http(provider.httpConfig).then(function(response) {
                return response.data.data.user;
            });
        }
    }
}

/**
 * @ngdoc service
 * @name authInterceptor
 * @description 拦截接口异常请求，如果异常代码为用户授权异常则跳转到登陆页面
 */
function AuthInterceptor($q, $location, $rootScope, isAuthPage, systemCacheNs, StorageFactory) {
    var interceptor = {
        response     : response,
        responseError: responseError
    };
    var $cache = StorageFactory.$new(systemCacheNs);
    return interceptor;

    function response(response) {
        checkAuthError(response);
        return response;
    }

    function responseError(response) {
        checkAuthError(response);
        return $q.reject(response);
    }

    function checkAuthError(response) {
        if(angular.isObject(response.data) && response.data.errorCode == 401) {
            $rootScope.$broadcast('$logouted');
            if(!isAuthPage()) {
                $cache.put('authBack', $location.url());
                $location.url('/login');
            }
        }
    }
}

/**
 * check an object can instance of auth adapter interface
 * @param  {object} adapter auth adapter
 * @return {Boolean}
 */
function instanceOfAdapterInterface(adapter) {
    if(!angular.isFunction(adapter['auth'])) {
        throw 'auth adapter type error.';
    }
    return true;
}

function instanceOfStoreInterface(store) {
    if(!angular.isFunction(store['empty'])
        || !angular.isFunction(store['read'])
        || !angular.isFunction(store['write'])
        || !angular.isFunction(store['clear'])
    ) {
        throw 'auth store type error.';
    }
    return true;
}

})(window, window.angular);
