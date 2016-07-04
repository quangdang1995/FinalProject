(function() {
    'use strict';

    angular
        .module('app.authentication')
        .run(runApp);
        
    function runApp(routerHelper, $rootScope, $state) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            // TODO: explain the below error
            if (error === "AUTH_REQUIRED") { // single quote will cause the $state to not change
                $state.go('signIn');
            }
        });
        
        routerHelper.configureStates(getStates());
    }
    
    function getStates() {
        return [
            {
                state: 'signIn',
                config: {
                    url: '/signin',
                    templateUrl: 'app/authentication/signIn.html',
                    controller: 'SignInController',
                    controllerAs: 'vm',
                    resolve: {
                        'currentAuth': ['AuthService', function (AuthService) {
                            return AuthService.waitForSignIn();
                        }]
                    }
                }
            },
            {
                state: 'passwordReset',
                config: {
                    url: '/signin/recovery',
                    templateUrl: 'app/authentication/passwordReset.html',
                    controller: 'PasswordResetController',
                    controllerAs: 'vm'
                }
            },
            {
                state: 'signUp',
                config: {
                    url: '/signup',
                    templateUrl: 'app/authentication/signUp.html',
                    controller: 'SignUpController',
                    controllerAs: 'vm'
                }
            }
        ];
    }
})();