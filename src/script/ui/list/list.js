(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name ui.list
 * @description 提供与列表相关的功能
 */
angular
    .module('ui.list', ['ui.list.service'])
    .directive('list', ListDirective)
    .directive('listNotify', ListNotifyDirective)
    .directive('listPagination', ListPaginationDirective)
    .directive('listFilter', ListFilterDirective)
;

/**
 * @ngdoc directive
 * @ngInject
 * @name list
 * @description 通用列表指令
 */
function ListDirective($q) {
    var directive = {
        restrict   : 'E',
        replace    : true,
        templateUrl: '/template/ui/list.tpl.html',
        controller : ListDirectiveCtrl,
        transclude : true,
        link: ListDirectiveLink,
        scope      : {
            list : "=listService"
        }
    }
    return directive;

    function ListDirectiveLink($scope) {
        $scope.list.load();
    }

    /**
     * @ngdoc controller
     * @ngInject
     * @name listDirectiveCtrl
     * @description 通用列表指令控制器
     */
    function ListDirectiveCtrl($scope) {
        this.addInitPromise = addInitPromise;
        this.list           = $scope.list;

        function addInitPromise(promise) {
            $scope.list.addInitPromise(promise);
        }
    }
}

/**
 * @ngdoc directive
 * @name listNotify
 * @description 通用列表状态消息通知指令
 */
function ListNotifyDirective() {
    var directive = {
        require    : '^list',
        restrict   : 'E',
        replace    : true,
        templateUrl: '/template/ui/notify.tpl.html',
        controller : notifyDirectiveCtrl,
        link       : notifyDirectiveLink,
        scope      : {
            messages : "="
        }
    }
    return directive;

    function notifyDirectiveLink($scope, element, attrs, listCtrl) {
        $scope.list = listCtrl.list;
    }

    /**
     * @ngInject
     */
    function notifyDirectiveCtrl($scope) {

        var defaultMessage = {
            loading: '正在加载列表数据，请稍后...',
            empty: '没有符合条件的宝贝了！'
        };
        var customMessage = {};

        if(!angular.isUndefined($scope.messages)) {
            customMessage = $scope.messages;
        }

        $scope.listMessages = angular.extend(defaultMessage, customMessage);
    }
}

/**
 * @ngdoc directive
 * @name listPagination
 * @description 通用列表分页指令
 */
function ListPaginationDirective() {
    var directive = {
        require    : '^list',
        restrict   : 'E',
        replace    : true,
        templateUrl: '/template/ui/pagination.tpl.html',
        link: {
            pre: function(scope, element, attrs, ctrl) {
                scope.list = ctrl.list;
            }
        },
        controller : paginationDirectiveCtrl,
        scope      : {}
    };
    return directive;

    /**
    * @ngInject
    */
    function paginationDirectiveCtrl($scope) {
        $scope.pageChange = function(num) {
            if($scope.list.page !== num) {
                $scope.list.page = num;
                $scope.list.load();
            }
        }
    }
}

/**
 * @ngdoc directive
 * @name listFilter
 * @description 通用列表数据筛选器指令
 */
function ListFilterDirective() {
    var directive = {
        require    : '^list',
        restrict   : 'E',
        replace    : true,
        transclude : true,
        templateUrl: '/template/ui/filter.tpl.html',
        link       : filterDirectiveLink,
        controller : filterDirectiveCtrl,
        scope      : {
            listFilterInitPromise : "="
        }
    }
    return directive;

    function filterDirectiveLink($scope, element, attrs, listCtrl) {
        $scope.list               = listCtrl.list;
        if(!angular.isUndefined($scope.listFilterInitPromise)) {
            listCtrl.addInitPromise($scope.listFilterInitPromise);
        }
    }

    /**
     * @ngInject
     */
    function filterDirectiveCtrl($scope) {
        $scope.load = load;

        function load(){
            $scope.list.page = 1;
            $scope.list.load();
        }
    }
}
})(window.angular);
