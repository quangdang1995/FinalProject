(function() {
    'use strict';

    angular.module('app', [
        'app.core',
        'app.landing', 'app.profile', 'app.authentication',
        'app.widgets', 'app.layout'
    ]);
})();
(function() {
    'use strict';

    angular.module('app.authentication', [
        'app.core'
    ]);
})();
(function() {
    'use strict';

    angular.module('app.core', [
        'blocks.router',
        // Firebase
        'firebase',
        // Bootstrap
        'ngAnimate'
    ]);
})();
(function() {
    'use strict';

    angular.module('app.landing', [
        
    ]);
})();
(function() {
    'use strict';

    angular.module('app.layout', [
        'app.core',
        'ui.bootstrap'
    ]);
})();
(function() {
    'use strict';

    angular.module('app.profile', [
        'app.core'
    ]);
})();
(function() {
    'use strict';

    angular.module('app.widgets', [
        
    ]);
})();
(function() {
    'use strict';

    angular.module('blocks.router', [
        'ui.router'
    ]);
})();
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
(function() {
'use strict';

    angular
        .module('app.authentication')
        .controller('SignInController', SignInController);

    SignInController.$inject = ['AuthService', '$state', 'currentAuth'];
    function SignInController(AuthService, $state, currentAuth) {
        var vm = this;
        vm.email = null;
        vm.password = null;
        vm.isError = false;
        vm.isRemember = true;
        vm.signIn = signIn;
        vm.signOut = signOut;
        vm.currentAuth = currentAuth;

        activate();

        ////////////////

        function activate() {
        }
        
        function signIn() {
            return AuthService.signIn(vm.email, vm.password)
                // sign in completed
                .then(function (authData) {
                    $state.go('profile/edit');
                })
                // sign in failed
                .catch(function (error) {
                    vm.isError = true;
                });
        }
        
        function signOut() {
            AuthService.signOut();
            vm.currentAuth = null;
            $state.reload();
        }
    }
})();
(function() {
'use strict';

    angular
        .module('app.authentication')
        .controller('SignUpController', SignUpController);

    SignUpController.$inject = ['$state', 'AuthService', 'DataService'];
    function SignUpController($state, AuthService, DataService) {
        var vm = this;
        vm.firstName = null;
        vm.lastName = null;
        vm.email = null;
        vm.password = null;
        vm.signUp = signUp;

        activate();

        ////////////////

        function activate() { }
        
        function signUp() {
            var information = {
                firstName: vm.firstName,
                lastName: vm.lastName
            };            
            
            AuthService.signUp(vm.email, vm.password)
                .then(function (uid) {
                    DataService.createNewProfile(uid, information);
                    $state.go("profile/edit");
                }).catch(function (error) {
                    console.log(error);
                });
        }
    }
})();
(function() {
'use strict';

    angular
        .module('app.core')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$firebaseAuth', '$q'];
    function AuthService($firebaseAuth, $q) { 
        var auth = $firebaseAuth();
        var ref = firebase.database().ref();
               
        var service = {
            signIn: signIn,
            signOut: signOut,
            signUp: signUp,
            waitForSignIn: waitForSignIn,
            requireSignIn: requireSignIn,
            createUserData: createUserData
        };
        
        return service;

        ////////////////
        
        function signIn(email, password) {
            return auth.$signInWithEmailAndPassword(email, password);
        }
        
        function signOut() {
            auth.$signOut();
        }
        
        function signUp(email, password) {
            // Return a promise that will create a profile, sign in
            // and then return the uid of that account
            return $q(function (resolve, reject) {
                auth.$createUserWithEmailAndPassword(email, password)
                    // Get the new user id
                    .then(function(userData) {
                        // Create a new user save location
                        createUserData(userData.uid);
                        resolve(userData.uid);
                    }).catch(function(error) {
                        reject(error);
                    });
            });
        }
        
        function createUserData(uid) {
            ref.child('users').child(uid)
                .set(true);
        }
        
        function waitForSignIn() {
            return auth.$waitForSignIn();
        }
        
        function requireSignIn() {
            return auth.$requireSignIn();
        }
    }
})();
(function() {
    'use strict';

    angular
        .module('app.core')
        .config(configure);
        
    function configure() {
        var config = {
            apiKey: "AIzaSyD_HjgtrnStBw7Unl8nO4Hxy1CKhXsddhI",
            authDomain: "linkin.firebaseapp.com",
            databaseURL: "https://linkin.firebaseio.com",
            storageBucket: "project-3564736192784272662.appspot.com",
        };
        firebase.initializeApp(config);
    }
})();
(function() {
'use strict';

    angular
        .module('app.core')
        .factory('DataService', DataService);

    DataService.$inject = ['$firebaseObject', '$firebaseArray', '$q'];
    function DataService($firebaseObject, $firebaseArray, $q) {
        var ref = firebase.database().ref();
        
        var service = {
            createNewProfile: createNewProfile,
            getProfile: getProfile,
            saveProfile: saveProfile,
            
            createNewFollowRecord: createNewFollowRecord,
            deleteFollowRecord: deleteFollowRecord,
            loadFollowingRecords: loadFollowingRecords,
            loadFollowedRecords: loadFollowedRecords,
            
            educations: {
                load: loadEducation,
                add: addEducation,
                delete: deleteEducation,
                edit: editEducation
            },
            
            users: {
                search: searchUser,
                load: loadUser
            }
        };
        
        return service;

        ////////////////
        
        function loadEducation(uid) {
            return $firebaseArray(ref.child('educations').child(uid)).$loaded();
        }
        
        function addEducation(educationList, education) {
            educationList.$add(education);
        }
        
        function deleteEducation(educationList, index) {
            educationList.$remove(index);
        }
        
        function editEducation(educationList, index, education) {
            educationList[index] = education;
            educationList.$save(index);
        }
        
        // Follow
        function createNewFollowRecord(userUid, targetUid) {
            ref.child('following').child(userUid).child(targetUid)
                .set(true);
            ref.child('followed').child(targetUid).child(userUid)
                .set(true);
        }
        
        function deleteFollowRecord(userUid, targetUid) {
            console.log(userUid);
            console.log(targetUid);
            ref.child('following').child(userUid).child(targetUid)
                .remove()
                .then(function() {
                    console.log("Remove succeeded.");
                })
                .catch(function(error) {
                    console.log("Remove failed: " + error.message);
                });
            ref.child('followed').child(targetUid).child(userUid)
                .remove()
                .then(function() {
                    console.log("Remove succeeded.");
                })
                .catch(function(error) {
                    console.log("Remove failed: " + error.message);
                });
        }
        
        function loadFollowingRecords(uid) {
            return $firebaseArray(ref.child('following').child(uid)).$loaded();
        }
        
        function loadFollowedRecords(uid) {
            return $firebaseArray(ref.child('followed').child(uid)).$loaded();
        }
        
        // profile
        function createNewProfile(uid, information) {
            ref.child('profiles').child(uid)
                .set(information);
        }
        
        function getProfile(uid) {
            var data = $firebaseObject(ref.child('profiles').child(uid));
            return data.$loaded();
        }
        
        function saveProfile(profile) {
            return profile.$save()
                .then()
                .catch(function (error) {
                    // TODO: catch error
                });
        }
        
        function searchUser(searchQuerry) {
            return $firebaseArray(ref.child('profiles').orderByChild('firstName').equalTo(searchQuerry))
                .$loaded();
        }
        
        function loadUser() {
            return $firebaseArray(ref.child('profiles').orderByChild('firstName'))
                .$loaded();
        }
    }
})();
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
(function() {
'use strict';

    angular
        .module('app.landing')
        .controller('LandingController', LandingController);

    //LandingController.$inject = [''];
    function LandingController() {
        var vm = this;
        

        activate();

        ////////////////

        function activate() { }
    }
})();
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
(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('navbar', navbar);

    navbar.$inject = ['$state', 'DataService'];
    function navbar() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            controller: NavbarController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/layout/navbar.html',
            scope: {
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function NavbarController ($state, DataService) {
        var vm = this;
        vm.isNavbarCollapse = true;
        vm.users = null;
        vm.selectedUser = null;
        vm.searchUsers = searchUsers;

        activate();

        ////////////////
        
        function activate() {
            loadUsers();
        }
        
        function loadUsers() {
            DataService.users.load()
                .then(function (data) {
                    vm.users = data;
                });
        }
        
        function searchUsers() {
            $state.go('profile', {uid: vm.selectedUser.$id});
        }
    }
})();
(function() {
'use strict';

    angular
        .module('app.profile')
        .controller('EditProfileController', EditProfileController);

    EditProfileController.$inject = ['currentAuth', 'DataService'];
    function EditProfileController(currentAuth, DataService) {
        var isCreating = false;
        
        var vm = this;
        vm.account = {};
        vm.newEducation = {};
        vm.isInputing = [
            false, // name
            false, // about me
            false, // educations
            false, // certificates
            false // experiences
        ];
        vm.selectedItem = [
            -1, // name
            -1, // about me
            -1, // educations
            -1, // certificates
            -1 // experiences
        ];
        
        vm.toggleInputForm = toggleInputForm;
        vm.editEducation = editEducation;
        vm.deleteEducation = deleteEducation;
        vm.saveEducation = saveEducation;
        vm.cancelSaveEducation = cancelSaveEducation;
        
        activate();

        ////////////////

        function activate() {
            getData();
        }
        
        function getData() {
            DataService.getProfile(currentAuth.uid)
                .then(function (data) {
                    vm.account.profile = data;
                });
            DataService.educations.load(currentAuth.uid)
                .then(function (data) {
                    vm.account.educations = data;
                });
        }
        
        function saveEducation() {
            // Convert dates
            vm.newEducation.fromDate = new Date(vm.newEducation.fromDate).getTime();
            vm.newEducation.toDate = vm.newEducation.toDate === undefined
                                    || vm.newEducation.toDate == ""
                                    ? null : new Date(vm.newEducation.toDate).getTime();
            // Check if the user is adding new information or editing existing information
            if (isCreating === true) {
                // Add to database
                DataService.educations.add(vm.account.educations, vm.newEducation);
            }
            else {
                // Copy data
                DataService.educations.edit(vm.account.educations, vm.selectedItem[2], vm.newEducation);
            }
            // Close form
            vm.toggleInputForm(2);
            // Reset form
            vm.selectedItem[2] = -1;
            vm.newEducation = {};
        }
        
        function cancelSaveEducation() {
            // Close form
            vm.toggleInputForm(2);
            // Reset form
            vm.selectedItem[2] = -1;
            vm.newEducation = {};
        }
        
        function editEducation(education) {
            // Pass in the edit one
            vm.newEducation = angular.copy(education);
            // Convert date
            vm.newEducation.fromDate = new Date(vm.newEducation.fromDate).toDateString();
            vm.newEducation.toDate = vm.newEducation.toDate === undefined ? null : new Date(vm.newEducation.toDate).toDateString();
            // Open the form
            toggleInputForm(2);
            isCreating = false;
        }
        
        function deleteEducation(index) {
            DataService.educations.delete(vm.account.educations, index);
        }
        
        function toggleInputForm(index) {
            isCreating = true;
            vm.isInputing[index] = !vm.isInputing[index];
        }
    }
})();
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
(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('editableContainer', editableContainer);

    //editableContainer.$inject = [''];
    function editableContainer() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            transclude: true,
            bindToController: true,
            controller: editableContainerController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            templateUrl: 'app/widgets/editableContainer.html',
            scope: {
                edit: '&',
                delete: '&'
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    /* @ngInject */
    function editableContainerController () {
        var vm = this;
        
        vm.isShowAuxiliary = false;
        vm.toogleEdit = ToogleEdit;
        
        ////////////////
        
        function ToogleEdit() {
            vm.isShowAuxiliary = !vm.isShowAuxiliary;
        }
    }
})();
(function() {
'use strict';

    angular
        .module('blocks.router')
        .provider('routerHelper', routerHelperProvider);

    routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
    /* @ngInject */
    function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {
        /* jshint validthis:true */
        this.$get = RouterHelper;
        
        $locationProvider.html5Mode(true);

        RouterHelper.$inject = ['$state'];
        /* @ngInject */
        function RouterHelper($state) {
            var hasOtherwise = false;

            var service = {
                configureStates: configureStates,
                getStates: getStates
            };

            return service;

            ///////////////

            function configureStates(states, otherwisePath) {
                states.forEach(function(state) {
                    $stateProvider.state(state.state, state.config);
                });
                if (otherwisePath && !hasOtherwise) {
                    hasOtherwise = true;
                    $urlRouterProvider.otherwise(otherwisePath);
                }
            }

            function getStates() { return $state.get(); }
        }
    }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhdXRoZW50aWNhdGlvbi9hdXRoZW50aWNhdGlvbi5tb2R1bGUuanMiLCJjb3JlL2NvcmUubW9kdWxlLmpzIiwibGFuZGluZy9sYW5kaW5nLm1vZHVsZS5qcyIsImxheW91dC9sYXlvdXQubW9kdWxlLmpzIiwicHJvZmlsZS9wcm9maWxlLm1vZHVsZS5qcyIsIndpZGdldHMvd2lkZ2V0cy5tb2R1bGUuanMiLCJibG9ja3Mvcm91dGVyL3JvdXRlci5tb2R1bGUuanMiLCJhdXRoZW50aWNhdGlvbi9hdXRoZW50aWNhdGlvbi5yb3V0ZS5qcyIsImF1dGhlbnRpY2F0aW9uL3Bhc3N3b3JkUmVzZXQuY29udHJvbGxlci5qcyIsImF1dGhlbnRpY2F0aW9uL3NpZ25Jbi5jb250cm9sbGVyLmpzIiwiYXV0aGVudGljYXRpb24vc2lnblVwLmNvbnRyb2xsZXIuanMiLCJjb3JlL2NvcmUuYXV0aHNlcnZpY2UuanMiLCJjb3JlL2NvcmUuY29uZmlnLmpzIiwiY29yZS9jb3JlLmRhdGFzZXJ2aWNlLmpzIiwiY29yZS9jb3JlLnJvdXRlLmpzIiwibGFuZGluZy9sYW5kaW5nLmNvbnRyb2xsZXIuanMiLCJsYW5kaW5nL2xhbmRpbmcucm91dGUuanMiLCJsYXlvdXQvbmF2YmFyLmRpcmVjdGl2ZS5qcyIsInByb2ZpbGUvZWRpdC5jb250cm9sbGVyLmpzIiwicHJvZmlsZS9wcm9maWxlLmNvbnRyb2xsZXIuanMiLCJwcm9maWxlL3Byb2ZpbGUucm91dGUuanMiLCJ3aWRnZXRzL2J1dHRvblNraWxsLmRpcmVjdGl2ZS5qcyIsIndpZGdldHMvY2FyZC5kaXJlY3RpdmUuanMiLCJ3aWRnZXRzL2NhcmRTZWN0aW9uLmRpcmVjdGl2ZS5qcyIsIndpZGdldHMvZWRpdGFibGVDb250YWluZXIuZGlyZWN0aXZlLmpzIiwiYmxvY2tzL3JvdXRlci9yb3V0ZXItaGVscGVyLnByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgICAgICdhcHAuY29yZScsXG4gICAgICAgICdhcHAubGFuZGluZycsICdhcHAucHJvZmlsZScsICdhcHAuYXV0aGVudGljYXRpb24nLFxuICAgICAgICAnYXBwLndpZGdldHMnLCAnYXBwLmxheW91dCdcbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuYXV0aGVudGljYXRpb24nLCBbXG4gICAgICAgICdhcHAuY29yZSdcbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAuY29yZScsIFtcbiAgICAgICAgJ2Jsb2Nrcy5yb3V0ZXInLFxuICAgICAgICAvLyBGaXJlYmFzZVxuICAgICAgICAnZmlyZWJhc2UnLFxuICAgICAgICAvLyBCb290c3RyYXBcbiAgICAgICAgJ25nQW5pbWF0ZSdcbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAubGFuZGluZycsIFtcbiAgICAgICAgXG4gICAgXSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnYXBwLmxheW91dCcsIFtcbiAgICAgICAgJ2FwcC5jb3JlJyxcbiAgICAgICAgJ3VpLmJvb3RzdHJhcCdcbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdhcHAucHJvZmlsZScsIFtcbiAgICAgICAgJ2FwcC5jb3JlJ1xuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhci5tb2R1bGUoJ2FwcC53aWRnZXRzJywgW1xuICAgICAgICBcbiAgICBdKTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXIubW9kdWxlKCdibG9ja3Mucm91dGVyJywgW1xuICAgICAgICAndWkucm91dGVyJ1xuICAgIF0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAuYXV0aGVudGljYXRpb24nKVxuICAgICAgICAucnVuKHJ1bkFwcCk7XG4gICAgICAgIFxuICAgIGZ1bmN0aW9uIHJ1bkFwcChyb3V0ZXJIZWxwZXIsICRyb290U2NvcGUsICRzdGF0ZSkge1xuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlRXJyb3InLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcywgZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IGV4cGxhaW4gdGhlIGJlbG93IGVycm9yXG4gICAgICAgICAgICBpZiAoZXJyb3IgPT09IFwiQVVUSF9SRVFVSVJFRFwiKSB7IC8vIHNpbmdsZSBxdW90ZSB3aWxsIGNhdXNlIHRoZSAkc3RhdGUgdG8gbm90IGNoYW5nZVxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc2lnbkluJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgcm91dGVySGVscGVyLmNvbmZpZ3VyZVN0YXRlcyhnZXRTdGF0ZXMoKSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGdldFN0YXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ3NpZ25JbicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9hdXRoZW50aWNhdGlvbi9zaWduSW4uaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaWduSW5Db250cm9sbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnY3VycmVudEF1dGgnOiBbJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24gKEF1dGhTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLndhaXRGb3JTaWduSW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRlOiAncGFzc3dvcmRSZXNldCcsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zaWduaW4vcmVjb3ZlcnknLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9hdXRoZW50aWNhdGlvbi9wYXNzd29yZFJlc2V0Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUGFzc3dvcmRSZXNldENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRlOiAnc2lnblVwJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL2F1dGhlbnRpY2F0aW9uL3NpZ25VcC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NpZ25VcENvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2FwcC5hdXRoZW50aWNhdGlvbicpXG4gICAgICAgIC5jb250cm9sbGVyKCdQYXNzd29yZFJlc2V0Q29udHJvbGxlcicsIFBhc3N3b3JkUmVzZXRDb250cm9sbGVyKTtcblxuICAgIFBhc3N3b3JkUmVzZXRDb250cm9sbGVyLiRpbmplY3QgPSBbJ0F1dGhTZXJ2aWNlJ107XG4gICAgZnVuY3Rpb24gUGFzc3dvcmRSZXNldENvbnRyb2xsZXIoQXV0aFNlcnZpY2UpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgICAgXG5cbiAgICAgICAgYWN0aXZhdGUoKTtcblxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7IH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYXBwLmF1dGhlbnRpY2F0aW9uJylcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1NpZ25JbkNvbnRyb2xsZXInLCBTaWduSW5Db250cm9sbGVyKTtcblxuICAgIFNpZ25JbkNvbnRyb2xsZXIuJGluamVjdCA9IFsnQXV0aFNlcnZpY2UnLCAnJHN0YXRlJywgJ2N1cnJlbnRBdXRoJ107XG4gICAgZnVuY3Rpb24gU2lnbkluQ29udHJvbGxlcihBdXRoU2VydmljZSwgJHN0YXRlLCBjdXJyZW50QXV0aCkge1xuICAgICAgICB2YXIgdm0gPSB0aGlzO1xuICAgICAgICB2bS5lbWFpbCA9IG51bGw7XG4gICAgICAgIHZtLnBhc3N3b3JkID0gbnVsbDtcbiAgICAgICAgdm0uaXNFcnJvciA9IGZhbHNlO1xuICAgICAgICB2bS5pc1JlbWVtYmVyID0gdHJ1ZTtcbiAgICAgICAgdm0uc2lnbkluID0gc2lnbkluO1xuICAgICAgICB2bS5zaWduT3V0ID0gc2lnbk91dDtcbiAgICAgICAgdm0uY3VycmVudEF1dGggPSBjdXJyZW50QXV0aDtcblxuICAgICAgICBhY3RpdmF0ZSgpO1xuXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2lnbkluKCkge1xuICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLnNpZ25Jbih2bS5lbWFpbCwgdm0ucGFzc3dvcmQpXG4gICAgICAgICAgICAgICAgLy8gc2lnbiBpbiBjb21wbGV0ZWRcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoYXV0aERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdwcm9maWxlL2VkaXQnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIHNpZ24gaW4gZmFpbGVkXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB2bS5pc0Vycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2lnbk91dCgpIHtcbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLnNpZ25PdXQoKTtcbiAgICAgICAgICAgIHZtLmN1cnJlbnRBdXRoID0gbnVsbDtcbiAgICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAuYXV0aGVudGljYXRpb24nKVxuICAgICAgICAuY29udHJvbGxlcignU2lnblVwQ29udHJvbGxlcicsIFNpZ25VcENvbnRyb2xsZXIpO1xuXG4gICAgU2lnblVwQ29udHJvbGxlci4kaW5qZWN0ID0gWyckc3RhdGUnLCAnQXV0aFNlcnZpY2UnLCAnRGF0YVNlcnZpY2UnXTtcbiAgICBmdW5jdGlvbiBTaWduVXBDb250cm9sbGVyKCRzdGF0ZSwgQXV0aFNlcnZpY2UsIERhdGFTZXJ2aWNlKSB7XG4gICAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICAgIHZtLmZpcnN0TmFtZSA9IG51bGw7XG4gICAgICAgIHZtLmxhc3ROYW1lID0gbnVsbDtcbiAgICAgICAgdm0uZW1haWwgPSBudWxsO1xuICAgICAgICB2bS5wYXNzd29yZCA9IG51bGw7XG4gICAgICAgIHZtLnNpZ25VcCA9IHNpZ25VcDtcblxuICAgICAgICBhY3RpdmF0ZSgpO1xuXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZSgpIHsgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2lnblVwKCkge1xuICAgICAgICAgICAgdmFyIGluZm9ybWF0aW9uID0ge1xuICAgICAgICAgICAgICAgIGZpcnN0TmFtZTogdm0uZmlyc3ROYW1lLFxuICAgICAgICAgICAgICAgIGxhc3ROYW1lOiB2bS5sYXN0TmFtZVxuICAgICAgICAgICAgfTsgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQXV0aFNlcnZpY2Uuc2lnblVwKHZtLmVtYWlsLCB2bS5wYXNzd29yZClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIERhdGFTZXJ2aWNlLmNyZWF0ZU5ld1Byb2ZpbGUodWlkLCBpbmZvcm1hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhcInByb2ZpbGUvZWRpdFwiKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2FwcC5jb3JlJylcbiAgICAgICAgLmZhY3RvcnkoJ0F1dGhTZXJ2aWNlJywgQXV0aFNlcnZpY2UpO1xuXG4gICAgQXV0aFNlcnZpY2UuJGluamVjdCA9IFsnJGZpcmViYXNlQXV0aCcsICckcSddO1xuICAgIGZ1bmN0aW9uIEF1dGhTZXJ2aWNlKCRmaXJlYmFzZUF1dGgsICRxKSB7IFxuICAgICAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICAgICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgdmFyIHNlcnZpY2UgPSB7XG4gICAgICAgICAgICBzaWduSW46IHNpZ25JbixcbiAgICAgICAgICAgIHNpZ25PdXQ6IHNpZ25PdXQsXG4gICAgICAgICAgICBzaWduVXA6IHNpZ25VcCxcbiAgICAgICAgICAgIHdhaXRGb3JTaWduSW46IHdhaXRGb3JTaWduSW4sXG4gICAgICAgICAgICByZXF1aXJlU2lnbkluOiByZXF1aXJlU2lnbkluLFxuICAgICAgICAgICAgY3JlYXRlVXNlckRhdGE6IGNyZWF0ZVVzZXJEYXRhXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc2VydmljZTtcblxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBzaWduSW4oZW1haWwsIHBhc3N3b3JkKSB7XG4gICAgICAgICAgICByZXR1cm4gYXV0aC4kc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQoZW1haWwsIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2lnbk91dCgpIHtcbiAgICAgICAgICAgIGF1dGguJHNpZ25PdXQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2lnblVwKGVtYWlsLCBwYXNzd29yZCkge1xuICAgICAgICAgICAgLy8gUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgY3JlYXRlIGEgcHJvZmlsZSwgc2lnbiBpblxuICAgICAgICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIHRoZSB1aWQgb2YgdGhhdCBhY2NvdW50XG4gICAgICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIGF1dGguJGNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZChlbWFpbCwgcGFzc3dvcmQpXG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgbmV3IHVzZXIgaWRcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlckRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyB1c2VyIHNhdmUgbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVVzZXJEYXRhKHVzZXJEYXRhLnVpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVzZXJEYXRhLnVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVVc2VyRGF0YSh1aWQpIHtcbiAgICAgICAgICAgIHJlZi5jaGlsZCgndXNlcnMnKS5jaGlsZCh1aWQpXG4gICAgICAgICAgICAgICAgLnNldCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gd2FpdEZvclNpZ25JbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhdXRoLiR3YWl0Rm9yU2lnbkluKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVpcmVTaWduSW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gYXV0aC4kcmVxdWlyZVNpZ25JbigpO1xuICAgICAgICB9XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAuY29yZScpXG4gICAgICAgIC5jb25maWcoY29uZmlndXJlKTtcbiAgICAgICAgXG4gICAgZnVuY3Rpb24gY29uZmlndXJlKCkge1xuICAgICAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICAgICAgYXBpS2V5OiBcIkFJemFTeURfSGpndHJuU3RCdzdVbmw4bk80SHh5MUNLaFhzZGRoSVwiLFxuICAgICAgICAgICAgYXV0aERvbWFpbjogXCJsaW5raW4uZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL2xpbmtpbi5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJwcm9qZWN0LTM1NjQ3MzYxOTI3ODQyNzI2NjIuYXBwc3BvdC5jb21cIixcbiAgICAgICAgfTtcbiAgICAgICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAuY29yZScpXG4gICAgICAgIC5mYWN0b3J5KCdEYXRhU2VydmljZScsIERhdGFTZXJ2aWNlKTtcblxuICAgIERhdGFTZXJ2aWNlLiRpbmplY3QgPSBbJyRmaXJlYmFzZU9iamVjdCcsICckZmlyZWJhc2VBcnJheScsICckcSddO1xuICAgIGZ1bmN0aW9uIERhdGFTZXJ2aWNlKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXksICRxKSB7XG4gICAgICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgICAgICBcbiAgICAgICAgdmFyIHNlcnZpY2UgPSB7XG4gICAgICAgICAgICBjcmVhdGVOZXdQcm9maWxlOiBjcmVhdGVOZXdQcm9maWxlLFxuICAgICAgICAgICAgZ2V0UHJvZmlsZTogZ2V0UHJvZmlsZSxcbiAgICAgICAgICAgIHNhdmVQcm9maWxlOiBzYXZlUHJvZmlsZSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3JlYXRlTmV3Rm9sbG93UmVjb3JkOiBjcmVhdGVOZXdGb2xsb3dSZWNvcmQsXG4gICAgICAgICAgICBkZWxldGVGb2xsb3dSZWNvcmQ6IGRlbGV0ZUZvbGxvd1JlY29yZCxcbiAgICAgICAgICAgIGxvYWRGb2xsb3dpbmdSZWNvcmRzOiBsb2FkRm9sbG93aW5nUmVjb3JkcyxcbiAgICAgICAgICAgIGxvYWRGb2xsb3dlZFJlY29yZHM6IGxvYWRGb2xsb3dlZFJlY29yZHMsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGVkdWNhdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBsb2FkOiBsb2FkRWR1Y2F0aW9uLFxuICAgICAgICAgICAgICAgIGFkZDogYWRkRWR1Y2F0aW9uLFxuICAgICAgICAgICAgICAgIGRlbGV0ZTogZGVsZXRlRWR1Y2F0aW9uLFxuICAgICAgICAgICAgICAgIGVkaXQ6IGVkaXRFZHVjYXRpb25cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHVzZXJzOiB7XG4gICAgICAgICAgICAgICAgc2VhcmNoOiBzZWFyY2hVc2VyLFxuICAgICAgICAgICAgICAgIGxvYWQ6IGxvYWRVc2VyXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc2VydmljZTtcblxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBsb2FkRWR1Y2F0aW9uKHVpZCkge1xuICAgICAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZWR1Y2F0aW9ucycpLmNoaWxkKHVpZCkpLiRsb2FkZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gYWRkRWR1Y2F0aW9uKGVkdWNhdGlvbkxpc3QsIGVkdWNhdGlvbikge1xuICAgICAgICAgICAgZWR1Y2F0aW9uTGlzdC4kYWRkKGVkdWNhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZUVkdWNhdGlvbihlZHVjYXRpb25MaXN0LCBpbmRleCkge1xuICAgICAgICAgICAgZWR1Y2F0aW9uTGlzdC4kcmVtb3ZlKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZWRpdEVkdWNhdGlvbihlZHVjYXRpb25MaXN0LCBpbmRleCwgZWR1Y2F0aW9uKSB7XG4gICAgICAgICAgICBlZHVjYXRpb25MaXN0W2luZGV4XSA9IGVkdWNhdGlvbjtcbiAgICAgICAgICAgIGVkdWNhdGlvbkxpc3QuJHNhdmUoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBGb2xsb3dcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlTmV3Rm9sbG93UmVjb3JkKHVzZXJVaWQsIHRhcmdldFVpZCkge1xuICAgICAgICAgICAgcmVmLmNoaWxkKCdmb2xsb3dpbmcnKS5jaGlsZCh1c2VyVWlkKS5jaGlsZCh0YXJnZXRVaWQpXG4gICAgICAgICAgICAgICAgLnNldCh0cnVlKTtcbiAgICAgICAgICAgIHJlZi5jaGlsZCgnZm9sbG93ZWQnKS5jaGlsZCh0YXJnZXRVaWQpLmNoaWxkKHVzZXJVaWQpXG4gICAgICAgICAgICAgICAgLnNldCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlRm9sbG93UmVjb3JkKHVzZXJVaWQsIHRhcmdldFVpZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2codXNlclVpZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0YXJnZXRVaWQpO1xuICAgICAgICAgICAgcmVmLmNoaWxkKCdmb2xsb3dpbmcnKS5jaGlsZCh1c2VyVWlkKS5jaGlsZCh0YXJnZXRVaWQpXG4gICAgICAgICAgICAgICAgLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVtb3ZlIHN1Y2NlZWRlZC5cIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmUgZmFpbGVkOiBcIiArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVmLmNoaWxkKCdmb2xsb3dlZCcpLmNoaWxkKHRhcmdldFVpZCkuY2hpbGQodXNlclVpZClcbiAgICAgICAgICAgICAgICAucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZW1vdmUgc3VjY2VlZGVkLlwiKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlbW92ZSBmYWlsZWQ6IFwiICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRGb2xsb3dpbmdSZWNvcmRzKHVpZCkge1xuICAgICAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZm9sbG93aW5nJykuY2hpbGQodWlkKSkuJGxvYWRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBsb2FkRm9sbG93ZWRSZWNvcmRzKHVpZCkge1xuICAgICAgICAgICAgcmV0dXJuICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZm9sbG93ZWQnKS5jaGlsZCh1aWQpKS4kbG9hZGVkKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIHByb2ZpbGVcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlTmV3UHJvZmlsZSh1aWQsIGluZm9ybWF0aW9uKSB7XG4gICAgICAgICAgICByZWYuY2hpbGQoJ3Byb2ZpbGVzJykuY2hpbGQodWlkKVxuICAgICAgICAgICAgICAgIC5zZXQoaW5mb3JtYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBnZXRQcm9maWxlKHVpZCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSAkZmlyZWJhc2VPYmplY3QocmVmLmNoaWxkKCdwcm9maWxlcycpLmNoaWxkKHVpZCkpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEuJGxvYWRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBzYXZlUHJvZmlsZShwcm9maWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvZmlsZS4kc2F2ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoVXNlcihzZWFyY2hRdWVycnkpIHtcbiAgICAgICAgICAgIHJldHVybiAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ3Byb2ZpbGVzJykub3JkZXJCeUNoaWxkKCdmaXJzdE5hbWUnKS5lcXVhbFRvKHNlYXJjaFF1ZXJyeSkpXG4gICAgICAgICAgICAgICAgLiRsb2FkZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gbG9hZFVzZXIoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdwcm9maWxlcycpLm9yZGVyQnlDaGlsZCgnZmlyc3ROYW1lJykpXG4gICAgICAgICAgICAgICAgLiRsb2FkZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAuY29yZScpXG4gICAgICAgIC5ydW4ocnVuQXBwKTtcblxuICAgIGZ1bmN0aW9uIHJ1bkFwcChyb3V0ZXJIZWxwZXIpIHtcbiAgICAgICAgdmFyIG90aGVyd2lzZSA9ICcvNDA0JztcbiAgICAgICAgcm91dGVySGVscGVyLmNvbmZpZ3VyZVN0YXRlcyhnZXRTdGF0ZXMoKSwgb3RoZXJ3aXNlKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gZ2V0U3RhdGVzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRlOiAnNDA0JyxcbiAgICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnLzQwNCcsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL2NvcmUvNDA0Lmh0bWwnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1dO1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAubGFuZGluZycpXG4gICAgICAgIC5jb250cm9sbGVyKCdMYW5kaW5nQ29udHJvbGxlcicsIExhbmRpbmdDb250cm9sbGVyKTtcblxuICAgIC8vTGFuZGluZ0NvbnRyb2xsZXIuJGluamVjdCA9IFsnJ107XG4gICAgZnVuY3Rpb24gTGFuZGluZ0NvbnRyb2xsZXIoKSB7XG4gICAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICAgIFxuXG4gICAgICAgIGFjdGl2YXRlKCk7XG5cbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkgeyB9XG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAubGFuZGluZycpXG4gICAgICAgIC5ydW4ocnVuQXBwKTtcbiAgICAgICAgXG4gICAgZnVuY3Rpb24gcnVuQXBwKHJvdXRlckhlbHBlcikge1xuICAgICAgICByb3V0ZXJIZWxwZXIuY29uZmlndXJlU3RhdGVzKGdldFN0YXRlcygpKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gZ2V0U3RhdGVzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0YXRlOiAnaG9tZScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9sYW5kaW5nL2xhbmRpbmcuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMYW5kaW5nQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2FwcC5sYXlvdXQnKVxuICAgICAgICAuZGlyZWN0aXZlKCduYXZiYXInLCBuYXZiYXIpO1xuXG4gICAgbmF2YmFyLiRpbmplY3QgPSBbJyRzdGF0ZScsICdEYXRhU2VydmljZSddO1xuICAgIGZ1bmN0aW9uIG5hdmJhcigpIHtcbiAgICAgICAgLy8gVXNhZ2U6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIENyZWF0ZXM6XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBkaXJlY3RpdmUgPSB7XG4gICAgICAgICAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuICAgICAgICAgICAgY29udHJvbGxlcjogTmF2YmFyQ29udHJvbGxlcixcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgICAgIGxpbms6IGxpbmssXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvbGF5b3V0L25hdmJhci5odG1sJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qIEBuZ0luamVjdCAqL1xuICAgIGZ1bmN0aW9uIE5hdmJhckNvbnRyb2xsZXIgKCRzdGF0ZSwgRGF0YVNlcnZpY2UpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgICAgdm0uaXNOYXZiYXJDb2xsYXBzZSA9IHRydWU7XG4gICAgICAgIHZtLnVzZXJzID0gbnVsbDtcbiAgICAgICAgdm0uc2VsZWN0ZWRVc2VyID0gbnVsbDtcbiAgICAgICAgdm0uc2VhcmNoVXNlcnMgPSBzZWFyY2hVc2VycztcblxuICAgICAgICBhY3RpdmF0ZSgpO1xuXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICAgICAgICAgICAgbG9hZFVzZXJzKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGxvYWRVc2VycygpIHtcbiAgICAgICAgICAgIERhdGFTZXJ2aWNlLnVzZXJzLmxvYWQoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtLnVzZXJzID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoVXNlcnMoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3Byb2ZpbGUnLCB7dWlkOiB2bS5zZWxlY3RlZFVzZXIuJGlkfSk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYXBwLnByb2ZpbGUnKVxuICAgICAgICAuY29udHJvbGxlcignRWRpdFByb2ZpbGVDb250cm9sbGVyJywgRWRpdFByb2ZpbGVDb250cm9sbGVyKTtcblxuICAgIEVkaXRQcm9maWxlQ29udHJvbGxlci4kaW5qZWN0ID0gWydjdXJyZW50QXV0aCcsICdEYXRhU2VydmljZSddO1xuICAgIGZ1bmN0aW9uIEVkaXRQcm9maWxlQ29udHJvbGxlcihjdXJyZW50QXV0aCwgRGF0YVNlcnZpY2UpIHtcbiAgICAgICAgdmFyIGlzQ3JlYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICAgIHZtLmFjY291bnQgPSB7fTtcbiAgICAgICAgdm0ubmV3RWR1Y2F0aW9uID0ge307XG4gICAgICAgIHZtLmlzSW5wdXRpbmcgPSBbXG4gICAgICAgICAgICBmYWxzZSwgLy8gbmFtZVxuICAgICAgICAgICAgZmFsc2UsIC8vIGFib3V0IG1lXG4gICAgICAgICAgICBmYWxzZSwgLy8gZWR1Y2F0aW9uc1xuICAgICAgICAgICAgZmFsc2UsIC8vIGNlcnRpZmljYXRlc1xuICAgICAgICAgICAgZmFsc2UgLy8gZXhwZXJpZW5jZXNcbiAgICAgICAgXTtcbiAgICAgICAgdm0uc2VsZWN0ZWRJdGVtID0gW1xuICAgICAgICAgICAgLTEsIC8vIG5hbWVcbiAgICAgICAgICAgIC0xLCAvLyBhYm91dCBtZVxuICAgICAgICAgICAgLTEsIC8vIGVkdWNhdGlvbnNcbiAgICAgICAgICAgIC0xLCAvLyBjZXJ0aWZpY2F0ZXNcbiAgICAgICAgICAgIC0xIC8vIGV4cGVyaWVuY2VzXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICB2bS50b2dnbGVJbnB1dEZvcm0gPSB0b2dnbGVJbnB1dEZvcm07XG4gICAgICAgIHZtLmVkaXRFZHVjYXRpb24gPSBlZGl0RWR1Y2F0aW9uO1xuICAgICAgICB2bS5kZWxldGVFZHVjYXRpb24gPSBkZWxldGVFZHVjYXRpb247XG4gICAgICAgIHZtLnNhdmVFZHVjYXRpb24gPSBzYXZlRWR1Y2F0aW9uO1xuICAgICAgICB2bS5jYW5jZWxTYXZlRWR1Y2F0aW9uID0gY2FuY2VsU2F2ZUVkdWNhdGlvbjtcbiAgICAgICAgXG4gICAgICAgIGFjdGl2YXRlKCk7XG5cbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICAgICAgICAgICAgZ2V0RGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBnZXREYXRhKCkge1xuICAgICAgICAgICAgRGF0YVNlcnZpY2UuZ2V0UHJvZmlsZShjdXJyZW50QXV0aC51aWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uYWNjb3VudC5wcm9maWxlID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIERhdGFTZXJ2aWNlLmVkdWNhdGlvbnMubG9hZChjdXJyZW50QXV0aC51aWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uYWNjb3VudC5lZHVjYXRpb25zID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2F2ZUVkdWNhdGlvbigpIHtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgZGF0ZXNcbiAgICAgICAgICAgIHZtLm5ld0VkdWNhdGlvbi5mcm9tRGF0ZSA9IG5ldyBEYXRlKHZtLm5ld0VkdWNhdGlvbi5mcm9tRGF0ZSkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdm0ubmV3RWR1Y2F0aW9uLnRvRGF0ZSA9IHZtLm5ld0VkdWNhdGlvbi50b0RhdGUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgdm0ubmV3RWR1Y2F0aW9uLnRvRGF0ZSA9PSBcIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IG51bGwgOiBuZXcgRGF0ZSh2bS5uZXdFZHVjYXRpb24udG9EYXRlKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgdXNlciBpcyBhZGRpbmcgbmV3IGluZm9ybWF0aW9uIG9yIGVkaXRpbmcgZXhpc3RpbmcgaW5mb3JtYXRpb25cbiAgICAgICAgICAgIGlmIChpc0NyZWF0aW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRkIHRvIGRhdGFiYXNlXG4gICAgICAgICAgICAgICAgRGF0YVNlcnZpY2UuZWR1Y2F0aW9ucy5hZGQodm0uYWNjb3VudC5lZHVjYXRpb25zLCB2bS5uZXdFZHVjYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ29weSBkYXRhXG4gICAgICAgICAgICAgICAgRGF0YVNlcnZpY2UuZWR1Y2F0aW9ucy5lZGl0KHZtLmFjY291bnQuZWR1Y2F0aW9ucywgdm0uc2VsZWN0ZWRJdGVtWzJdLCB2bS5uZXdFZHVjYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2xvc2UgZm9ybVxuICAgICAgICAgICAgdm0udG9nZ2xlSW5wdXRGb3JtKDIpO1xuICAgICAgICAgICAgLy8gUmVzZXQgZm9ybVxuICAgICAgICAgICAgdm0uc2VsZWN0ZWRJdGVtWzJdID0gLTE7XG4gICAgICAgICAgICB2bS5uZXdFZHVjYXRpb24gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gY2FuY2VsU2F2ZUVkdWNhdGlvbigpIHtcbiAgICAgICAgICAgIC8vIENsb3NlIGZvcm1cbiAgICAgICAgICAgIHZtLnRvZ2dsZUlucHV0Rm9ybSgyKTtcbiAgICAgICAgICAgIC8vIFJlc2V0IGZvcm1cbiAgICAgICAgICAgIHZtLnNlbGVjdGVkSXRlbVsyXSA9IC0xO1xuICAgICAgICAgICAgdm0ubmV3RWR1Y2F0aW9uID0ge307XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGVkaXRFZHVjYXRpb24oZWR1Y2F0aW9uKSB7XG4gICAgICAgICAgICAvLyBQYXNzIGluIHRoZSBlZGl0IG9uZVxuICAgICAgICAgICAgdm0ubmV3RWR1Y2F0aW9uID0gYW5ndWxhci5jb3B5KGVkdWNhdGlvbik7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IGRhdGVcbiAgICAgICAgICAgIHZtLm5ld0VkdWNhdGlvbi5mcm9tRGF0ZSA9IG5ldyBEYXRlKHZtLm5ld0VkdWNhdGlvbi5mcm9tRGF0ZSkudG9EYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB2bS5uZXdFZHVjYXRpb24udG9EYXRlID0gdm0ubmV3RWR1Y2F0aW9uLnRvRGF0ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG5ldyBEYXRlKHZtLm5ld0VkdWNhdGlvbi50b0RhdGUpLnRvRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgLy8gT3BlbiB0aGUgZm9ybVxuICAgICAgICAgICAgdG9nZ2xlSW5wdXRGb3JtKDIpO1xuICAgICAgICAgICAgaXNDcmVhdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBkZWxldGVFZHVjYXRpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIERhdGFTZXJ2aWNlLmVkdWNhdGlvbnMuZGVsZXRlKHZtLmFjY291bnQuZWR1Y2F0aW9ucywgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiB0b2dnbGVJbnB1dEZvcm0oaW5kZXgpIHtcbiAgICAgICAgICAgIGlzQ3JlYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdm0uaXNJbnB1dGluZ1tpbmRleF0gPSAhdm0uaXNJbnB1dGluZ1tpbmRleF07XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYXBwLnByb2ZpbGUnKVxuICAgICAgICAuY29udHJvbGxlcignUHJvZmlsZUNvbnRyb2xsZXInLCBQcm9maWxlQ29udHJvbGxlcik7XG5cbiAgICBQcm9maWxlQ29udHJvbGxlci4kaW5qZWN0ID0gWydjdXJyZW50QXV0aCcsICckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJ0RhdGFTZXJ2aWNlJywgJ0F1dGhTZXJ2aWNlJ107XG4gICAgZnVuY3Rpb24gUHJvZmlsZUNvbnRyb2xsZXIoY3VycmVudEF1dGgsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBEYXRhU2VydmljZSwgQXV0aFNlcnZpY2UpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgICAgdm0uYWNjb3VudCA9IHt9O1xuICAgICAgICB2bS5mb2xsb3dlZFJlY29yZHMgPSBudWxsO1xuICAgICAgICB2bS5pc0FscmVhZHlGb2xsb3dlZCA9IGZhbHNlO1xuICAgICAgICB2bS5mb2xsb3cgPSBmb2xsb3c7XG5cbiAgICAgICAgYWN0aXZhdGUoKTtcblxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gICAgICAgICAgICAvLyBMb2FkIGRhdGFcbiAgICAgICAgICAgIGdldERhdGEoJHN0YXRlUGFyYW1zLnVpZCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGdldERhdGEodWlkKSB7XG4gICAgICAgICAgICBEYXRhU2VydmljZS5nZXRQcm9maWxlKHVpZClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2bS5hY2NvdW50LnByb2ZpbGUgPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgRGF0YVNlcnZpY2UuZWR1Y2F0aW9ucy5sb2FkKHVpZClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2bS5hY2NvdW50LmVkdWNhdGlvbnMgPSBkYXRhO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgRGF0YVNlcnZpY2UubG9hZEZvbGxvd2VkUmVjb3Jkcyh1aWQpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdm0uZm9sbG93ZWRSZWNvcmRzID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBzaWduZWQgdXNlciBpcyBhbHJlYWR5IGZvbGxvd2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50QXV0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codm0uZm9sbG93ZWRSZWNvcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZtLmZvbGxvd2VkUmVjb3Jkcy4kZ2V0UmVjb3JkKGN1cnJlbnRBdXRoLnVpZCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZtLmZvbGxvd2VkUmVjb3Jkcy4kZ2V0UmVjb3JkKGN1cnJlbnRBdXRoLnVpZCkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5pc0FscmVhZHlGb2xsb3dlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZm9sbG93KCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHVzZXIgc2lnbmVkIGluXG4gICAgICAgICAgICBpZiAoY3VycmVudEF1dGggPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3NpZ25JbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHVzZXJzIGlzIGZvbGxvdy91bmZvbGxvdyBoaXMgb3duIGFjY291bnRcbiAgICAgICAgICAgIGlmIChjdXJyZW50QXV0aC51aWQgIT0gJHN0YXRlUGFyYW1zLnVpZClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgdXNlciBpcyBhbHJlYWR5IGZvbGxvd1xuICAgICAgICAgICAgICAgIGlmICh2bS5pc0FscmVhZHlGb2xsb3dlZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuZm9sbG93XCIpO1xuICAgICAgICAgICAgICAgICAgICBEYXRhU2VydmljZS5kZWxldGVGb2xsb3dSZWNvcmQoY3VycmVudEF1dGgudWlkLCAkc3RhdGVQYXJhbXMudWlkKTtcbiAgICAgICAgICAgICAgICAgICAgdm0uaXNBbHJlYWR5Rm9sbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvbGxvd1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZvbGxvd1wiKTtcbiAgICAgICAgICAgICAgICAgICAgRGF0YVNlcnZpY2UuY3JlYXRlTmV3Rm9sbG93UmVjb3JkKGN1cnJlbnRBdXRoLnVpZCwgJHN0YXRlUGFyYW1zLnVpZCk7XG4gICAgICAgICAgICAgICAgICAgIHZtLmlzQWxyZWFkeUZvbGxvd2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2FwcC5wcm9maWxlJylcbiAgICAgICAgLnJ1bihydW5BcHApO1xuICAgIFxuICAgIGZ1bmN0aW9uIHJ1bkFwcChyb3V0ZXJIZWxwZXIpIHtcbiAgICAgICAgcm91dGVySGVscGVyLmNvbmZpZ3VyZVN0YXRlcyhnZXRTdGF0ZXMoKSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGdldFN0YXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ3Byb2ZpbGUnLFxuICAgICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvcHJvZmlsZT91aWQnLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wcm9maWxlL3Byb2ZpbGUuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ29udHJvbGxlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnJlbnRBdXRoJzogWydBdXRoU2VydmljZScsIGZ1bmN0aW9uIChBdXRoU2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS53YWl0Rm9yU2lnbkluKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogJ3Byb2ZpbGUvZWRpdCcsXG4gICAgICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9wcm9maWxlL2VkaXQnLFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC9wcm9maWxlL2VkaXQuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdFZGl0UHJvZmlsZUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdjdXJyZW50QXV0aCc6IFsnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoQXV0aFNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UucmVxdWlyZVNpZ25JbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2FwcC53aWRnZXRzJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnYnV0dG9uU2tpbGwnLCBidXR0b25Ta2lsbCk7XG5cbiAgICAvL2J1dHRvblNraWxsLiRpbmplY3QgPSBbJyddO1xuICAgIGZ1bmN0aW9uIGJ1dHRvblNraWxsKCkge1xuICAgICAgICAvLyBVc2FnZTpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQ3JlYXRlczpcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IHtcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgICAgICBjb250cm9sbGVyOiBCdXR0b25Ta2lsbENvbnRyb2xsZXIsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgICAgICBsaW5rOiBsaW5rLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3dpZGdldHMvYnV0dG9uU2tpbGwuaHRtbCcsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdAJyxcbiAgICAgICAgICAgICAgICBlbmRvcnNlckNvdW50OiAnQCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogQG5nSW5qZWN0ICovXG4gICAgZnVuY3Rpb24gQnV0dG9uU2tpbGxDb250cm9sbGVyICgpIHtcbiAgICAgICAgdmFyIHZtID0gdGhpcztcbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ2FwcC53aWRnZXRzJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnY2FyZCcsIGNhcmQpO1xuXG4gICAgZnVuY3Rpb24gY2FyZCgpIHtcbiAgICAgICAgLy8gVXNhZ2U6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIENyZWF0ZXM6XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBkaXJlY3RpdmUgPSB7XG4gICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IENhcmRDb250cm9sbGVyLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICAgICAgbGluazogbGluayxcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2FwcC93aWRnZXRzL2NhcmQuaHRtbCcsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnQCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogQG5nSW5qZWN0ICovXG4gICAgZnVuY3Rpb24gQ2FyZENvbnRyb2xsZXIgKCkge1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnYXBwLndpZGdldHMnKVxuICAgICAgICAuZGlyZWN0aXZlKCdjYXJkU2VjdGlvbicsIGNhcmRTZWN0aW9uKTtcblxuICAgIC8vY2FyZFNlY3Rpb24uJGluamVjdCA9IFsnJ107XG4gICAgZnVuY3Rpb24gY2FyZFNlY3Rpb24oKSB7XG4gICAgICAgIC8vIFVzYWdlOlxuICAgICAgICAvL1xuICAgICAgICAvLyBDcmVhdGVzOlxuICAgICAgICAvL1xuICAgICAgICB2YXIgZGlyZWN0aXZlID0ge1xuICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG4gICAgICAgICAgICBjb250cm9sbGVyOiBDYXJkU2VjdGlvbkNvbnRyb2xsZXIsXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgICAgICBsaW5rOiBsaW5rLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnYXBwL3dpZGdldHMvY2FyZFNlY3Rpb24uaHRtbCcsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnQCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogQG5nSW5qZWN0ICovXG4gICAgZnVuY3Rpb24gQ2FyZFNlY3Rpb25Db250cm9sbGVyICgpIHtcbiAgICAgICAgXG4gICAgfVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdhcHAud2lkZ2V0cycpXG4gICAgICAgIC5kaXJlY3RpdmUoJ2VkaXRhYmxlQ29udGFpbmVyJywgZWRpdGFibGVDb250YWluZXIpO1xuXG4gICAgLy9lZGl0YWJsZUNvbnRhaW5lci4kaW5qZWN0ID0gWycnXTtcbiAgICBmdW5jdGlvbiBlZGl0YWJsZUNvbnRhaW5lcigpIHtcbiAgICAgICAgLy8gVXNhZ2U6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIENyZWF0ZXM6XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBkaXJlY3RpdmUgPSB7XG4gICAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGVkaXRhYmxlQ29udGFpbmVyQ29udHJvbGxlcixcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgICAgIGxpbms6IGxpbmssXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdhcHAvd2lkZ2V0cy9lZGl0YWJsZUNvbnRhaW5lci5odG1sJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgZWRpdDogJyYnLFxuICAgICAgICAgICAgICAgIGRlbGV0ZTogJyYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qIEBuZ0luamVjdCAqL1xuICAgIGZ1bmN0aW9uIGVkaXRhYmxlQ29udGFpbmVyQ29udHJvbGxlciAoKSB7XG4gICAgICAgIHZhciB2bSA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICB2bS5pc1Nob3dBdXhpbGlhcnkgPSBmYWxzZTtcbiAgICAgICAgdm0udG9vZ2xlRWRpdCA9IFRvb2dsZUVkaXQ7XG4gICAgICAgIFxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBUb29nbGVFZGl0KCkge1xuICAgICAgICAgICAgdm0uaXNTaG93QXV4aWxpYXJ5ID0gIXZtLmlzU2hvd0F1eGlsaWFyeTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdibG9ja3Mucm91dGVyJylcbiAgICAgICAgLnByb3ZpZGVyKCdyb3V0ZXJIZWxwZXInLCByb3V0ZXJIZWxwZXJQcm92aWRlcik7XG5cbiAgICByb3V0ZXJIZWxwZXJQcm92aWRlci4kaW5qZWN0ID0gWyckbG9jYXRpb25Qcm92aWRlcicsICckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInXTtcbiAgICAvKiBAbmdJbmplY3QgKi9cbiAgICBmdW5jdGlvbiByb3V0ZXJIZWxwZXJQcm92aWRlcigkbG9jYXRpb25Qcm92aWRlciwgJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICAgICAvKiBqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgICAgdGhpcy4kZ2V0ID0gUm91dGVySGVscGVyO1xuICAgICAgICBcbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG4gICAgICAgIFJvdXRlckhlbHBlci4kaW5qZWN0ID0gWyckc3RhdGUnXTtcbiAgICAgICAgLyogQG5nSW5qZWN0ICovXG4gICAgICAgIGZ1bmN0aW9uIFJvdXRlckhlbHBlcigkc3RhdGUpIHtcbiAgICAgICAgICAgIHZhciBoYXNPdGhlcndpc2UgPSBmYWxzZTtcblxuICAgICAgICAgICAgdmFyIHNlcnZpY2UgPSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJlU3RhdGVzOiBjb25maWd1cmVTdGF0ZXMsXG4gICAgICAgICAgICAgICAgZ2V0U3RhdGVzOiBnZXRTdGF0ZXNcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlO1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgZnVuY3Rpb24gY29uZmlndXJlU3RhdGVzKHN0YXRlcywgb3RoZXJ3aXNlUGF0aCkge1xuICAgICAgICAgICAgICAgIHN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKHN0YXRlLnN0YXRlLCBzdGF0ZS5jb25maWcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChvdGhlcndpc2VQYXRoICYmICFoYXNPdGhlcndpc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzT3RoZXJ3aXNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShvdGhlcndpc2VQYXRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFN0YXRlcygpIHsgcmV0dXJuICRzdGF0ZS5nZXQoKTsgfVxuICAgICAgICB9XG4gICAgfVxufSkoKTsiXX0=
