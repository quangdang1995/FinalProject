(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('card', card);

    function card() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            transclude: true,
            bindToController: true,
            controller: CardController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/widgets/card.html',
            scope: {
                title: '@'
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function CardController () {
    }
})();