(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name service
 * @description 提供一些与具体业务无关的系统服务
 */
angular
    .module('system', ['system.api', 'system.api.v2', 'system.config', 'system.storage', 'system.math']);

})(window.angular);
