(function(angular, undefined) {'use strict';

/**
 * @ngdoc module
 * @name system.config
 * @description 系统配置管理服务，在具体的应用中应该根据应用的需要进行修改
 */
angular
    .module('system.config', [])
    .constant('systemConfig', {
        gateway: 'http://cloudapi.yoloke.com',
        baseUrl: 'http://cloud.yoloke.com/dev',
        appCodes: ['zhikrCloudJd', 'zhikrCloudTaobao', 'zhikrCloudSuning', 'zhikrCloudYouzan', 'zhikrCloudWeidian', 'zhikrCloudDian121', 'zhikrCloudYouzanKdsq'],
        oauthApps: [
            {
                code: 'zhikrCloudJd',
                name: '京东店铺'
            },
            {
                code: 'zhikrCloudTaobao',
                name: '淘宝店铺'
            },
            {
                code: 'zhikrCloudSuning',
                name: '苏宁店铺'
            },
            {
                code: 'zhikrCloudYouzan',
                name: '有赞店铺'
            },
            {
                code: 'zhikrCloudWeidian',
                name: '微店店铺'
            },
            {
                code: 'zhikrCloudDian121',
                name: '121店铺'
            },
            {
                code: 'zhikrCloudYouzanKdsq',
                name: '开店神器有赞版'
            }
        ],
        task: {
            types: {
                'productSync': {templateUrl: '/src/script/product/productSync/syncTaskDesc.tpl.html'},
                'productCopy': {templateUrl: '/src/script/product/productCopy/copyTaskDesc.tpl.html'}
            },
            status: {
                wait   : {color: 'default', icon: "fa-pause"},
                running: {color: 'info', icon: "fa-play"},
                failure: {color: 'danger', icon: "fa-exclamation-triangle"},
                success: {color: 'success', icon: "fa-check"}
            }
        }
    });
})(window.angular);
