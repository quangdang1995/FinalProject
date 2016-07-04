(function() {
'use strict';

    angular
        .module('app.authentication')
        .controller('PasswordResetController', PasswordResetController);

    PasswordResetController.$inject = ['AuthService'];
    function PasswordResetController(AuthService) {
        var vm = this;
        

        activate();

        ////////////////

        function activate() { }
    }
})();