(function(angular, undefined) {'use strict';

/**
 * 提供一个本地存储服务
 */
angular
    .module('system.storage', [])
    .factory('StorageFactory', StorageFactory)
;

function StorageFactory($window, $q) {
    var service = {
        $new: createStorage
    };
    return service;

    /**
     * 创建一个新的存储器
     * @param  {String} ns 存储器命名空间
     * @param {Object} options 存储器选项
     * @return {Storage}
     */
    function createStorage(ns, options) {
        return new Storage(ns, options);
    }

    function Storage(ns, options) {
        var self = this;
        /************ 公共属性 **********************/

        self.ns       = ns; // 当前存储器命名空间
        self.items    = {}; // 当前存储空间下的所有数据
        self.keyCount = 0; // 当前存储器中存储的项目数

        /************ 私有属性 **********************/

        var storage;    // 本地持久存储

        /************ 公共方法 **********************/

        self.put          = putItem; // 向存储器添加一个数据
        self.has          = hasItem; // 检查是否有指定key的数据
        self.get          = getItem; // 获取已存储的一个数据
        self.query        = queryItems; // 提供列表dataProvider支持
        self.remove       = removeItem; // 删除一个已存储的数据
        self.removeAll    = removeAll; // 删除所有数据
        self.destroy      = destroy; // 销毁存储空间
        self.hasLocalData = hasLocalData; // 检查当前本地存储是否具有当前存储器数据
        self.itemsToArray = itemsToArray;

        function itemsToArray() {
            var items = [];
            angular.forEach(self.items, function(item) {
                items.push(item);
            });
            return items;
        }

        function queryItems(params) {
            if(!angular.isObject(params)) {
                params = {};
            }
            if(!hasKey('page', params)) {
                params.page = 1;
            }
            if(!hasKey('pageSize', params)) {
                params.pageSize = 10;
            }

            var begin = (params.page - 1) * params.pageSize;
            if(begin > self.keyCount) {
                return result({
                    total: self.keyCount,
                    items: []
                });
            }
            var end = begin + params.pageSize;
            if(end > self.keyCount) {
                end = self.keyCount;
            }
            var keys = Object.keys(self.items).slice(begin, end);
            var items = [];
            angular.forEach(keys, function(key) {
                items.push(self.get(key));
            });

            return result({
                total: self.keyCount,
                items: items
            });

            function result(data) {
                var defer = $q.defer();
                defer.resolve(data);
                return defer.promise;
            }
        }

        function putItem(key, item) {
            self.items[key] = item;
            saveItems();
            return self;
        }

        function hasItem(key) {
            return hasKey(key, self.items);
        }

        function getItem(key, defaultValue, isRemove) {
            if(self.has(key)) {
                var v = self.items[key];
                if(isRemove) {
                    self.remove(key);
                }
                return v;
            }
            return defaultValue;
        }

        function removeItem(key) {
            if(angular.isUndefined(self.items[key])) {
                return;
            }
            delete self.items[key];
            saveItems();
        }

        function removeAll() {
            self.items = {};
            saveItems();
        }

        function destroy() {
            removeAll();
            if(!angular.isUndefined(storage)) {
                delete storage[self.ns];
            }
        }

        function hasLocalData() {
            if(angular.isUndefined(storage)) {
                return false;
            }
            var rawData = storage.getItem(self.ns);
            return (!angular.isUndefined(rawData) && rawData !== null);
        }

        /**************** 私有方法 ***************************/

        init(options);

        /**
         * 构造函数
         * @param  {Object} options 构造选项
         */
        function init(options) {
            if(!angular.isObject(options)) {
                options = {};
            }
            if(!hasKey('storage', options)) {
                options.storage = 'sessionStorage';
            }
            if(hasKey(options.storage, $window)) {
                storage = $window[options.storage];
            }
            if(!hasKey('readCacheCallback', options)) {
                options.readCacheCallback = function() {};
            }
            self.items = getItems(options.readCacheCallback);
            refreshItemCount();
        }

        function hasKey(key, obj) {
            if(!angular.isObject(obj)) {
                return false;
            }
            return !angular.isUndefined(obj[key]);
        }

        /**
         * 刷新当前存储空间下的数据量
         */
        function refreshItemCount() {
            self.keyCount = Object.keys(self.items).length;
        }

        /**
         * 获取已持久存储的数据
         * @return {Object}
         */
        function getItems(readCacheCallback) {
            if(angular.isUndefined(storage)) {
                return {};
            }
            var items = angular.fromJson(storage.getItem(self.ns));
            if(angular.isObject(items)) {
                readCacheCallback(items);
                return items;
            } else {
                return {};
            }
        }

        /**
         * 将当前内存中的数据持久存储
         */
        function saveItems() {
            if(angular.isUndefined(storage)) {
                return;
            }
            storage.setItem(self.ns, angular.toJson(self.items));
            refreshItemCount();
        }
    }
}

})(window.angular);
