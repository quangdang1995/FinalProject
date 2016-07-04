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