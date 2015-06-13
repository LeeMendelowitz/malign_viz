'use strict';

angular.module('malignerViewerApp')
  .controller('experimentCreateCtrl', function ($scope, $http, api, $modalInstance, $cookies, experimentDataService) {
    
    $scope.experiment_info_form = {
        "name" : "",
        "description" : ""
    };

    $scope.aln_file = "";
    $scope.query_file = "";
    $scope.ref_file = "";



    $scope.create_experiment = function() {

      console.log($scope.form);

      if(!$scope.form.$valid) {
        return;
      }

      // Strategy:
      // 1. Create the experiment by uploading the form with the experiment name and description.
      // 2. Upload the experiment files.

      var form_data = $scope.experiment_info_form;

      // $cookies.experiment_name = form_data.name;

      api.update_experiment(form_data.name, form_data).then(function() {

        var data = undefined;
        $modalInstance.close(data);

      }, function(data) {

        console.log("Could not update experiment data. " + data);

      });

      $scope.uploadFiles();

    };


    $scope.uploadFiles = function() {

        var fd = new FormData();

        fd.append('aln_file', $scope.aln_file);
        fd.append('query_file', $scope.query_file);
        fd.append('ref_file', $scope.ref_file);

        var uploadUrl = '/api/upload_experiment_files/' + $scope.experiment_info_form.name;

        //src: https://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data){
          console.log("upload file success!", data);
        })
        .error(function(data){
          console.log("upload file error!", data);
        });

    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };


  });
