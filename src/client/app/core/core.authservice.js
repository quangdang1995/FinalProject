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