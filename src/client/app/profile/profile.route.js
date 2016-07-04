(function() {
    'use strict';

    angular
        .module('app.profile')
        .run(runApp);
    
    function runApp(routerHelper) {
        routerHelper.configureStates(getStates());
    }
    
    function getStates() {
        return [
            {
                state: 'profile',
                config: {
                    url: '/profile?uid',
                    templateUrl: 'app/profile/profile.html',
                    controller: 'ProfileController',
                    controllerAs: 'vm',
                    resolve: {
                        'currentAuth': ['AuthService', function (AuthService) {
                            return AuthService.waitForSignIn();
                        }]
                    }
                }
            },
            {
                state: 'profile/edit',
                config: {
                    url: '/profile/edit',
                    templateUrl: 'app/profile/edit.html',
                    controller: 'EditProfileController',
                    controllerAs: 'vm',
                    resolve: {
                        'currentAuth': ['AuthService', function (AuthService) {
                            return AuthService.requireSignIn();
                        }]
                    }
                }
            }
        ];
    }
})();