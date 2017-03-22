(function(angular, undefined){'use strict';
	/**
	* 营销任务列表
	*/

	angular
		.module('promotionmisc.TaskList', [])
		.config(Configure)
		.controller('PromotionmiscTaskListCtrl', taskListCtrl);

	/**
	* @ngInject
	*/
	function Configure($stateProvider) {
		$stateProvider.state('member.promotion.promotionmisc.tasklist', {
			url: '/tasklist',
			parent: 'member.promotion.promotionmisc',
			templateUrl: '/template/promotion/promotionmisc/taskList.tpl.html',
			controller: 'PromotionmiscTaskListCtrl'
		})
	}

	/**
	* @ngInject
	*/
	function taskListCtrl($scope, $state, Task, listFactory, Shop) {
		$scope.statusOptions = Task.getStatusOptions();
		$scope.list = listFactory.$new(Task.query);
		$scope.list.addInitPromise(queryShop());
		$scope.list.addInitPromise(queryTypes());
		$scope.list.messages = {
			empty: '没有符合条件的任务！'
		};
		$scope.list.addLoadCallback(function(){
			var items = [];
			angular.forEach($scope.list.items, function(item){
				if(item.typeCode !== 'productSync' && item.typeCode !== 'productCopy' && item.typeCode !== 'productOptimize' && item.typeCode !== 'mobileDesc') {
					items.push(item);
				}
			});
			$scope.list.items = items;
		});
		
		$scope.statusName = '所有状态';
		$scope.typeName = '所有类型';

		$scope.restartTask = restartTask;
		$scope.equalComparator = equalComparator;

		function equalComparator(actual, expected){
            return angular.equals(actual, expected);
        }

		function queryShop() {
	        return Shop.query().then(function(data) {
	            $scope.list.filterOptions.shop = data.items[0].id;
	        });
	    }

	    function queryTypes() {
	    	return Task.getTypes().then(function(types){
	    		var typeOptions = [];
	    		angular.forEach(types.taskTypes, function(value){
	    			if(value.code !== 'productSync' && value.code !== 'productCopy' && value.code !== 'productOptimize' && value.code !== 'mobileDesc') {
	    				typeOptions.push(value);
	    			}
	    		});
	    		$scope.typeCodeOptions = typeOptions;
	    	});	
	    }

	    function restartTask(task) {
	    	$scope.restarting = true;
	    	Task.restart({taskId: task.id}).then(function(data){
	    		$scope.restarting = false;
	    	});
	    }
	}
})(window.angular);