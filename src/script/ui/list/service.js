(function(angular, undefined) {
    'use strict';

    angular
        .module('ui.list.service', [])
        .factory('listFactory', ListFactory);

    /**
     * @ngdoc factory
     * @ngInject
     * @name listFactory
     * @description
     * 	列表服务创建工厂，列表服务创建后可传递给列表指令进行列表的显示
     *
     * 	使用方法
     * 	=======
     *
     * 	var list = ListFactory(dataProvider, options);
     *
     * 	dataProvider
     * 	------------
     *
     * 	必须是一个包含query方法的对象或者函数，调用dataProvider对像的query方法或者
     * 	dataProvider函数后必须返回一个$q.promise。在promise的成功数据中必须包含
     * 	items数组和total属性。
     *
     * 	options
     * 	-------
     * 	ns         : 列表的命名空间，不设置将无法开启缓存服务
     * 	cache      : 是否开启列表本在缓存服务
     * 	cacheFields: 本地缓存需要存储的列表属性数组，默认为[filterOptions]
     */
    function ListFactory($q, StorageFactory) {
        var factory = {
            $new: createList
        }
        return factory;

        function createList(dataProvider, options) {
            if (!angular.isObject(options)) {
                options = {};
            }
            if (angular.isUndefined(options['ns'])) {
                var d = new Date();
                options.ns = 'list:' + d.getTime();
            }
            var cacheStorage = StorageFactory.$new(options.ns);
            var list = new List(dataProvider, cacheStorage, options);
            return list;
        }


        /**
         * 通用列表服务
         * @ngInject
         */
        function List(dataProvider, cacheStorage, options) {

            var self = this;

            self.status          = 'idle';
            self.page            = 1;
            self.pageSize        = 10;
            self.pageSizeOptions = [5, 10, 20, 30];
            self.items           = [];
            self.total           = 0;
            self.filterOptions   = {};
            self.loadError       = {};
            self.initPromises    = [];
            self.loadCallbacks   = [];
            self.cacheFields     = ['filterOptions'];
            self.dataProvider    = false;
            self.cacheStorage    = cacheStorage;
            self.options         = options;

            self.load           = load;
            self.addInitPromise = addInitPromise;
            self.addLoadCallback= addLoadCallback;
            self.isIdle         = isIdle;
            self.isLoading      = isLoading;
            self.isEmpty        = isEmpty;
            self.isLoadFailure  = isLoadFailure;

            init(dataProvider);

            function isIdle(isSetting) {
                return validOrChangeStatus('idle', isSetting);
            }

            function isLoading(isSetting) {
                return validOrChangeStatus('loading', isSetting);
            }

            function isLoadFailure(isSetting) {
                return validOrChangeStatus('failure', isSetting);
            }

            function isEmpty() {
                return (!self.isLoading() && self.items.length < 1);
            }

            function addInitPromise(promise) {
                self.initPromises.push(promise);
            }

            function addLoadCallback(callback) {
                self.loadCallbacks.push(callback);
            }

            function load() {
                self.isLoading(true);

                if(self.initPromises.length < 1) {
                    return doLoad();
                }

                return $q.all(self.initPromises).then(function() {
                    return doLoad();
                });
            }

            /****************** 私有方法 **********************/

            function init(dataProvider) {
                var defer = $q.defer();
                self.initPromises.push(defer.promise);

                setDataProvider(dataProvider);

                if(!angular.isUndefined(options['cacheFields']) && angular.isArray(options.cacheFields)) {
                    self.cacheFields = options.cacheFields;
                }

                if(self.cacheStorage.hasLocalData()) {
                    angular.forEach(self.cacheFields, function(field) {
                        self[field] = self.cacheStorage.get(field);
                    });
                }

                defer.resolve();
                return defer.promise;
            }

            function saveCache() {
                if(angular.isUndefined(options.cache) || options.cache === false) {
                    return;
                }

                angular.forEach(self.cacheFields, function(field) {
                    if(!angular.isUndefined(self[field])) {
                        self.cacheStorage.put(field, self[field]);
                    }
                });
            }

            function doLoad() {
                var params = angular.extend( {
                    page: self.page,
                    pageSize: self.pageSize
                }, self.filterOptions);
                return self.dataProvider(params).then(function(data) {
                    if(!angular.isUndefined(data.code) && data.code !== 200) {
                        self.loadError = {errorMessage: data.errorMessage};
                        self.isLoadFailure(true);
                    }else{
                        self.items = data.items;
                        self.total = data.total;
                        self.isIdle(true);
                        saveCache();
                        angular.forEach(self.loadCallbacks, function(callback){
                            callback();
                        });
                        return data;
                    }
                }, function(error) {
                    if(error.data) {
                        self.loadError = error.data;
                    }else {
                        self.loadError = error;
                    }
                    
                    self.isLoadFailure(true);
                });
            }

            function validOrChangeStatus(status, isSetting) {
                if (!angular.isUndefined(isSetting)) {
                    self.status = status;
                    return self;
                }
                return (self.status === status);
            }

            function setDataProvider(dataProvider) {
                if (angular.isObject(dataProvider)) {
                    if(!angular.isFunction(dataProvider.query)) {
                        throw '列表数据源对象必须实现query方法。';
                    }
                    self.dataProvider = dataProvider.query;
                    return;
                } else if (angular.isFunction(dataProvider)) {
                    self.dataProvider = dataProvider;
                    return;
                }

                throw '列表数据源必需是一个对象或者方法。';
            }
        }
    }

})(window.angular);
