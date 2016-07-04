(function() {
    'use strict';

    angular
        .module('app.landing')
        .run(runApp);
        
    function runApp(routerHelper) {
        routerHelper.configureStates(getStates());
    }
    
    function getStates() {
        return [
            {
                state: 'home',
                config: {
                    url: '/',
                    templateUrl: 'app/landing/landing.html',
                    controller: 'LandingController',
                    controllerAs: 'vm'
                }
            }
        ];
    }
})();