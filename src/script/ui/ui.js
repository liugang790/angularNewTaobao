(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name ui
 * @description 提供一些与业务无法的通用UI组件
 */
angular
    .module('ui', [
        'ui.list',
        'ui.modal',
        'ui.util',
        'ui.layout',
        'ui.menu',
        'ui.imageJigsaw',
        'ui.steps'
    ]);

})(window.angular);
