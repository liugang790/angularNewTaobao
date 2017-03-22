(function(angular, undefined) {'use strict';

/**
* zkf.util Module
*
* 定义一些工具类服务
*/
angular.module('ui.util', [])
    .filter('toDate', toDate)
    .factory('toTimestamp', toTimestamp)
    .service('redirectPage', redirectPageService)
    .directive('redirectPage', redirectPageDirective)

    // 提供延迟执行计时服务，例如：5秒后跳转页面
    .factory('deferWait', DeferWaitFactory)
;

function toDate() {
    return function(timestamp) {
        return timestamp * 1000;
    };
}

// 提供将输入的js date对象转换成时间戳
function toTimestamp(){
    return function name(dateObject){
        if(angular.isNumber(dateObject)) {
            return dateObject / 1000 | 0;
        }
        if(!angular.isDate(dateObject)) {
            dateObject = new Date();
        }
        return dateObject.getTime() / 1000 | 0;
    };
}

/**
 * 统一页面切换服务
 * @todo 根据当前应用是否开启html5模式需要切换调用location的url或path方法
 * @ngInject
 */
function redirectPageService($location) {
    return function(url) {
        $location.url(url);
    }
}

/**
 * 统一页面跳转指令，在需要跳转页面的元素上使用本指令当元素被点击后会跳转到指令的页面上
 * @ngInject
 */
function redirectPageDirective(redirectPage) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.bind('click', function() {
                scope.$apply(redirectPage(attr.redirectPage));
            });
        }
    }
}

/**
 * @ngInject
 */
function DeferWaitFactory($timeout) {
    var factory = {
        $new: createDeferWaitService
    };
    return factory;

    function createDeferWaitService(config) {
        return new DeferWait(config);
    }

    function DeferWait(config) {

        var service = this;
        this.timeRemaining = config.time;
        this.callback      = config.callback;
        this.start         = start;
        this.reset         = reset;

        function reset() {
            service.timeRemaining = config.time;
        }

        function start() {
            doCountdown();
        }

        function doCountdown() {
            $timeout(function() {
                service.timeRemaining--;
                if(service.timeRemaining > 0) {
                    doCountdown();
                } else {
                    service.callback();
                }
            }, 1000);
        }
    }
}

})(window.angular);
