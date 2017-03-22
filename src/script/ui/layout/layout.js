(function(angular, undefined) {'use strict';

angular
    .module('ui.layout', [])

    .directive('pageHeader', PageHeaderDirective)
    .directive('uiPage', PageDirective)
    .provider('layoutManager', LayoutManagerProvider)

    .service('pageLoadingService', PageLoadingService)
    .directive('pageLoading', PageLoadingDirective)
;

var layoutManagerProvider;

function LayoutManagerProvider() {
    layoutManagerProvider = this;

    this.defaultLayoutName = 'default';
    this.layouts = {
        default: '/src/script/ui/layout/defaultLayout.tpl.html'
    };
    this.addLayout = addLayout;
    this.$get = Layout;

    function addLayout(name, templateUrl) {
        this.layouts[name] = templateUrl;
    }
}

function Layout() {
    return {
        getLayout: getLayout
    };

    function getLayout(name) {
        if(angular.isUndefined(layoutManagerProvider.layouts[name])) {
            name = layoutManagerProvider.defaultLayoutName;
        }
        return layoutManagerProvider.layouts[name];
    }
}

/**
 * @ngdoc directive
 * @name pageHeader
 * @description 实现一个统一的页面头部分指令
 */
function PageHeaderDirective() {
    return {
        restrict   : 'E',
        replace    : true,
        templateUrl: '/src/script/ui/layout/pageHeader.tpl.html',
        transclude : true,
        scope      : {
            pageTitle: "@",
            pageSubTitle: "@"
        }
    }
}

/**
 * @ngInject
 */
function PageDirective(layoutManager) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: function(element, attr) {
            if(angular.isUndefined(attr['layout'])) {
                var layoutName = layoutManagerProvider.defaultLayoutName;
            } else {
                var layoutName = attr.layout;
            }
            return layoutManager.getLayout(layoutName);
        }
    }
}

/**
 * @ngdoc service
 * @ngInject
 * @name pageLoadingService
 * @description 提供对页面加载状态的监听
 */
function PageLoadingService($rootScope) {
    var service = {
        start    : start,
        isLoading: false
    }
    return service;

    function start() {
        $rootScope.$on('$routeChangeStart', function() {
            service.isLoading = true;
        });
        $rootScope.$on('$routeChangeSuccess', function() {
            service.isLoading = false;
        });
        $rootScope.$on('$routeChangeError', function() {
            service.isLoading = false;
        });
    }
}

/**
 * @ngdoc directive
 * @name pageLoading
 * @description 实现一个页面加载状态显示的指令
 */
function PageLoadingDirective() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/src/script/ui/layout/pageLoading.tpl.html',
        controller: /* @ngInject */function($scope, pageLoadingService) {
            $scope.loadingService = pageLoadingService;

        }
    }
}

})(window.angular);
