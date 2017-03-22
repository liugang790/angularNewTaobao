(function(window, angular, undefined) {'use strict';

angular
    .module('ui.modal', ['ui.bootstrap.modal'])
    .factory('Modal', ModalBoxFactory);

/* 
* @ngdoc factory
* @ngInject
* @ngdescription
*
* 模态框ui服务，调用open方法打开弹框
* modalDefine : 定义弹框类型，标题、内容、模板url、控制器、传给弹框数据resolve、弹框关闭result返回方法
* params      : 定义弹框样式，标题样式、按钮样式、弹框size大小
*/
    function ModalBoxFactory($uibModal, $rootScope) {
		var alertService = {
            show: open,
            close: closeWindow,
            ok: clickOkWindow,
            openModal: openModal,
        };
        var modalInstance;
        var scope = $rootScope.$new();
        scope.dismiss = alertService.close;
        scope.modalParams = {
            templateUrl : '',
            modalSize: ''
        };
    
        return alertService;
       
        function open(callback,modalDefine,params){
            checkModalDefine(modalDefine);
            checkParams(params);
            modalDefine.scope = scope;
            params.scope = scope;
            modalInstance = alertService.openModal(scope);
            if(typeof callback === 'function'){
                scope.callback = callback;
            }
            return modalInstance;
        }

        function checkModalDefine(modalDefine) {
            if('okFunction' in modalDefine) {
                scope.ok = modalDefine.okFunction;
            }else{
                scope.ok = alertService.ok;
            }
            if('closeFunction' in modalDefine) {
                scope.close = function() {
                    modalDefine.closeFunction.call(alertService.close);
                }
            }else{
               scope.close = alertService.close; 
            }
            if('includeTpl' in modalDefine){
                scope.modalParams.templateUrl = modalDefine.includeTpl;
            }
            if('resolve' in modalDefine){
                scope.modalParams.resolve = modalDefine.resolve;
            }
            if('controller' in modalDefine){
                scope.modalParams.controller = modalDefine.controller;
            }
            if('resultCallBack' in modalDefine){
                scope.resultCallBack = modalDefine.resultCallBack;
            }
        }
        function checkParams(params){
            if('content' in params) {
                scope.content = params.content ? params.content : '这是一个简单的通知消息';
            }
            scope.title =params.title ? params.title : '通知消息';
            scope.sure = params.sure ? params.sure : '确认';
            scope.cancel = params.cancel ? params.cancel : '取消';  
            scope.sureBtnShow = params.sureBtnShow ? params.sureBtnShow : false; 
            scope.closeBtnShow = params.closeBtnShow ? params.closeBtnShow : false;
            scope.titleClass = params.titleClass ?  'text-' + params.titleClass : 'text-danger'; 
            scope.btnSureClass = params.btnSureClass ? 'btn-' + params.btnSureClass : 'btn-primary'; 
            scope.btnCancelClass = params.btnCancelClass ? 'btn-' + params.btnCancelClass : 'btn-danger';
            scope.modalParams.modalSize = params.modalSize ? params.modalSize :'';
        }

        function openModal(scope){
            var openParams = {
                animation: true,
                templateUrl: '',
                scope: scope,
                size: scope.modalParams.modalSize
            };
            if('templateUrl' in scope.modalParams) {
                openParams.templateUrl = scope.modalParams.templateUrl;
            }
            if('resolve' in scope.modalParams) {
                openParams.resolve = scope.modalParams.resolve;
            }
            if('content' in scope){
                openParams.templateUrl = '/src/script/ui/modal/modalbox.tpl.html';
            }
            if('controller' in scope.modalParams) {
                openParams.controller = scope.modalParams.controller;
            }
            modalInstance = $uibModal.open(openParams);
            if('resultCallBack' in scope){
                modalInstance.result.then(scope.resultCallBack);
            }
            return modalInstance;
        }

        function closeWindow(){
            modalInstance.close();
        }

        function clickOkWindow(){
            modalInstance.close();  
            scope.callback();
        }

}})(window, window.angular);
