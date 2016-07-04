(function() {
'use strict';

    angular
        .module('app.authentication')
        .controller('SignInController', SignInController);

    SignInController.$inject = ['AuthService', '$state', 'currentAuth'];
    function SignInController(AuthService, $state, currentAuth) {
        var vm = this;
        vm.email = null;
        vm.password = null;
        vm.isError = false;
        vm.isRemember = true;
        vm.signIn = signIn;
        vm.signOut = signOut;
        vm.currentAuth = currentAuth;

        activate();

        ////////////////

        function activate() {
        }
        
        function signIn() {
            return AuthService.signIn(vm.email, vm.password)
                // sign in completed
                .then(function (authData) {
                    $state.go('profile/edit');
                })
                // sign in failed
                .catch(function (error) {
                    vm.isError = true;
                });
        }
        
        function signOut() {
            AuthService.signOut();
            vm.currentAuth = null;
            $state.reload();
        }
    }
})();