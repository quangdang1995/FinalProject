(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('navbar', navbar);

    navbar.$inject = ['$state', 'DataService'];
    function navbar() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: NavbarController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/layout/navbar.html',
            scope: {
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function NavbarController ($state, DataService) {
        var vm = this;
        vm.isNavbarCollapse = true;
        vm.users = null;
        vm.selectedUser = null;
        vm.searchUsers = searchUsers;

        activate();

        ////////////////
        
        function activate() {
            loadUsers();
        }
        
        function loadUsers() {
            DataService.users.load()
                .then(function (data) {
                    vm.users = data;
                });
        }
        
        function searchUsers() {
            $state.go('profile', {uid: vm.selectedUser.$id});
        }
    }
})();