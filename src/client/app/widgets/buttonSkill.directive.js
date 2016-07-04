(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('buttonSkill', buttonSkill);

    //buttonSkill.$inject = [''];
    function buttonSkill() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: ButtonSkillController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/widgets/buttonSkill.html',
            scope: {
                name: '@',
                endorserCount: '@'
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function ButtonSkillController () {
        var vm = this;
    }
})();