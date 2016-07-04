(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('cardSection', cardSection);

    //cardSection.$inject = [''];
    function cardSection() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            transclude: true,
            bindToController: true,
            controller: CardSectionController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/widgets/cardSection.html',
            scope: {
                title: '@'
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function CardSectionController () {
        
    }
})();