(function() {
'use strict';

    angular
        .module('app.profile')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['currentAuth', '$state', '$stateParams', 'DataService', 'AuthService'];
    function ProfileController(currentAuth, $state, $stateParams, DataService, AuthService) {
        var vm = this;
        vm.account = {};
        vm.followedRecords = null;
        vm.isAlreadyFollowed = false;
        vm.follow = follow;

        activate();

        ////////////////

        function activate() {
            // Load data
            getData($stateParams.uid);
        }
        
        function getData(uid) {
            DataService.getProfile(uid)
                .then(function (data) {
                    vm.account.profile = data;
                });
            DataService.educations.load(uid)
                .then(function (data) {
                    vm.account.educations = data;
                });
            DataService.loadFollowedRecords(uid)
                .then(function (data) {
                    vm.followedRecords = data;
                    
                    // Check if the signed user is already followed
                    if (currentAuth !== null) {
                        console.log(vm.followedRecords);
                        console.log(vm.followedRecords.$getRecord(currentAuth.uid));
                        if (vm.followedRecords.$getRecord(currentAuth.uid) !== null) {
                            vm.isAlreadyFollowed = true;
                        }
                    }
                });
        }
        
        function follow() {
            // Check if the user signed in
            if (currentAuth === null) {
                $state.go('signIn');
            }
            // Check if the users is follow/unfollow his own account
            if (currentAuth.uid != $stateParams.uid)
            {
                // Check if the user is already follow
                if (vm.isAlreadyFollowed) {
                    console.log("Unfollow");
                    DataService.deleteFollowRecord(currentAuth.uid, $stateParams.uid);
                    vm.isAlreadyFollowed = false;
                }
                else {
                    // Follow
                    console.log("Follow");
                    DataService.createNewFollowRecord(currentAuth.uid, $stateParams.uid);
                    vm.isAlreadyFollowed = true;
                }
            }
        }
    }
})();