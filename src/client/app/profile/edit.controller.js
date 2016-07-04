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