(function() {
'use strict';

    angular
        .module('app.core')
        .run(runApp);

    function runApp(routerHelper) {
        var otherwise = '/404';
        routerHelper.configureStates(getStates(), otherwise);
    }
    
    function getStates() {
        return [
            {
                state: '404',
                config: {
                    url: '/404',
                    templateUrl: 'app/core/404.html'
            }
        }];
    }
})();