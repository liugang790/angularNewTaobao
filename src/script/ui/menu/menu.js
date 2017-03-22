(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name app.menu
 * @description 提供与菜单相关的功能
 */
angular
    .module('ui.menu', [])
    .provider('menuManager', MenuManagerProvider)
    .service('isNavbarActive', IsNavbarActiveService)
    .service('menuRootNodes', MenuRootNodesFinder)
    .service('uiMenuCurrentChildren', CurrentChildrenFinder)
    .directive('menuList', MenuListDirective)
;

var menuManagerProvider;

function MenuManagerProvider() {
    menuManagerProvider = this;

    var allMenus = [];

    this.$get  = MenuManager;
    this.menus = menus;
    this.add   = addMenus;

    function menus() {
        return allMenus;
    }

    function addMenus(menuData) {
        var nameRegexp = new RegExp(/^[a-zA-Z0-9]+$/);
        if(angular.isUndefined(menuData['name'])
            || !nameRegexp.test(menuData.name)
            || angular.isUndefined(menuData['label'])
            || angular.isUndefined(menuData['level'])
            || angular.isUndefined(menuData['parentName'])
        ) {
            throw '菜单项配置错误';
        }

        if(angular.isUndefined(menuData['activeRoutes'])) {
            menuData.activeRoutes = menuData.pagePath;
        }

        if(angular.isUndefined(menuData['order'])) {
            menuData.order = 50;
        }

        if(angular.isUndefined(menuData['icons'])) {
            menuData.icons = '';
        }
        allMenus.push(menuData);
        return this;
    }
}

/**
 * @ngdoc service
 * @name menuManager
 * @ngInject
 */
function MenuManager($filter, isNavbarActive) {
    var menuManager = {
        menus    : menus,
        actives  : activeMenus,
        isActive : isActive,
        isDropDown: isDropDown
    };

    var allMenu = menuManagerProvider.menus();

    return menuManager;

    function activeMenus() {
        var menus = [];
        angular.forEach(allMenu, function(menu) {
            if(isActive(menu)) {
                menus.push(menu);
            }
        });
        return menus;
    }

    function isActive(menu) {
        return isNavbarActive(menu.activeRoutes);
    }

    function isDropDown(menu) {
        return (!angular.isUndefined(menu.dropdown) && menu.dropdown);
    }

    /**
     * 获取符合条件的菜单项目
     * @param  {Object} options 菜单查询选项
     * @return {Array}         符合条件的菜单数组
     */
    function menus(options) {
        if(angular.isUndefined(options)) {
            options = {};
        }
        return $filter('filter')(allMenu, options).sort(function(a, b) {
            return a.order - b.order;
        });
    }
}


/**
 * @ngInject
 * @param {[type]} menuManager [description]
 */
function MenuRootNodesFinder(menuManager) {
    var filter = {
        menus: menuManager.menus({}),
        setOptions: function(){
            return this;
        }
    };

    return filter;
}

/**
 * @ngInject
 */
function CurrentChildrenFinder($rootScope, $filter, menuManager) {
    var finder = {
        menus: [],
        options: {level: 2},
        setOptions: setOptions,
        refresh: refreshMenu
    };

    $rootScope.$on('$locationChangeSuccess', function() {
        finder.refresh();
    });

    return finder;

    function setOptions(options) {
        if(angular.isUndefined(options)) {
            options = {};
        }
        angular.extend(finder.options, options);
        this.refresh();
        return this;
    }

    function refreshMenu() {
        var menus = menuManager.actives();
        var parentLevel = this.options.level - 1;
        var parent = $filter('filter')(menus, {level:parentLevel});
        if(parent.length < 1) {
            return [];
        }

        this.menus = menuManager.menus({
            parentName: parent[0].name,
            level: this.options.level
        });
    }
}

/**
 * @ngdoc directive
 * @name menuList
 * @description 菜单列表
 */
function MenuListDirective() {
    return {
        restrict   : 'E',
        replace    : true,
        templateUrl: '/template/ui/menuList.tpl.html',
        controller : MenuListDirectiveCtrl,
        scope      : {
            menuFilter       : "@",
            menuFilterOptions: "=",
            menuListClass    : "="
        }
    }
}

/**
 * @ngdoc controller
 * @ngInject
 * @name MenuListDirectiveCtrl
 */
function MenuListDirectiveCtrl($scope, $injector, menuManager, $location) {
    $scope.isActive = isActive;
    $scope.goto     = gotoPage
    $scope.filter    = $injector.get($scope.menuFilter).setOptions($scope.menuFilterOptions);

    function gotoPage(path) {
        $location.path(path);
    }

    function isActive(menu) {
        return menuManager.isActive(menu);
    }

    function isDropDown(menu) {
        return menuManager.isDropDown(menu);
    }
}

/**
 * @ngdoc service
 * @ngInject
 * @name isNavbarActive
 * @description 根据菜单地址检查菜单的选中状态
 */
function IsNavbarActiveService($location) {
    return function isNavbarActive(navBarPaths) {
        if(angular.isObject(navBarPaths) && angular.isFunction(navBarPaths['test'])) {
            return navBarPaths.test($location.path());
        }
        if(angular.isString(navBarPaths)) {
            navBarPaths = [navBarPaths];
        }
        if(!angular.isArray(navBarPaths)) {
            return false;
        }

        for(var i in navBarPaths) {
            var navBarPath = navBarPaths[i];
            if(navBarPath === '/') {
                if($location.path() === '/') {
                    return true;
                }
            } else {
                var current = $location.path().substr(0, navBarPath.length);
                if(current === navBarPath) {
                    return true;
                }
            }
        }

        return false;
    }
}

})(window.angular);
