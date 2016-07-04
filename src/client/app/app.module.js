(function() {
    'use strict';

    angular.module('app', [
        'app.core',
        'app.landing', 'app.profile', 'app.authentication',
        'app.widgets', 'app.layout'
    ]);
})();