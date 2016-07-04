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