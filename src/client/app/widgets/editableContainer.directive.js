(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('editableContainer', editableContainer);

    //editableContainer.$inject = [''];
    function editableContainer() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            transclude: true,
            bindToController: true,
            controller: editableContainerController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/widgets/editableContainer.html',
            scope: {
                edit: '&',
                delete: '&'
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function editableContainerController () {
        var vm = this;
        
        vm.isShowAuxiliary = false;
        vm.toogleEdit = ToogleEdit;
        
        ////////////////
        
        function ToogleEdit() {
            vm.isShowAuxiliary = !vm.isShowAuxiliary;
        }
    }
})();