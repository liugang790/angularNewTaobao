(function(angular, undefined){'use strict';

    /*
    * 任务模块
    */
    angular
        .module('task', [])
        .provider('Task', TaskProvider);

    var provider;
    function TaskProvider() {
        provider = this;
        this.statusOptions = [
            {code: 'create', name: '未加入执行队列'},
            {code: 'wait', name: '等待执行'},
            {code: 'running', name: '正在执行'},
            {code: 'success', name: '执行成功'},
            {code: 'failure', name: '执行失败'}
        ];
        this.queryApiName = 'task.list';
        this.restartApiName = 'task.restart';
        this.typesApiConfig = {
            url: '/restApi/task/types',
            method: 'POST',
            cache: true
        };
        this.$get = taskFactory;
    }

    /**
    * @ngInject
    */
    function taskFactory($http, apiClient) {
        return {
            query : query,
            restart: restart,
            getStatusOptions: getStatusOptions,
            getTypes: getTypes
        };

        function query(params) {
            return apiClient.$new(provider.queryApiName).send(params).then(function(response){
                return response;
            });
        }

        function restart(params) {
            return apiClient.$new(provider.restartApiName).send(params).then(function(response){
                return response;
            });
        }

        function getStatusOptions() {
            return provider.statusOptions;
        }

        function getTypeCodeOptions() {
            return provider.typeCodeOptions;
        }

        function getTypes(params) {
            var httpConfig = provider.typesApiConfig;
            httpConfig.data = params;
            return $http(httpConfig).then(function(response){
                return response.data.data;
            });
        }
    }
})(window.angular);