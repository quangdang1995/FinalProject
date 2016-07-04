(function() {
'use strict';

    angular
        .module('app.authentication')
        .controller('SignUpController', SignUpController);

    SignUpController.$inject = ['$state', 'AuthService', 'DataService'];
    function SignUpController($state, AuthService, DataService) {
        var vm = this;
        vm.firstName = null;
        vm.lastName = null;
        vm.email = null;
        vm.password = null;
        vm.signUp = signUp;

        activate();

        ////////////////

        function activate() { }
        
        function signUp() {
            var information = {
                firstName: vm.firstName,
                lastName: vm.lastName
            };            
            
            AuthService.signUp(vm.email, vm.password)
                .then(function (uid) {
                    DataService.createNewProfile(uid, information);
                    $state.go("profile/edit");
                }).catch(function (error) {
                    console.log(error);
                });
        }
    }
})();