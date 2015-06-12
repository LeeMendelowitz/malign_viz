'use strict';

angular.module('malignerViewerApp')
  .controller('experimentEditCtrl', function ($scope, api, $modalInstance, experimentDataService, experiment_info) {
    
    $scope.experiment_info = experiment_info;
    $scope.experiment_info_form = angular.copy($scope.experiment_info);

    $scope.update = function(experiment_info_form) {

      api.update_experiment(experiment_info_form.name, experiment_info_form).then(function() {

        // Update the values in the offical copy of the experiment
        angular.extend($scope.experiment_info, experiment_info_form);
        experimentDataService.updateExperimentDescription($scope.experiment_info.name, $scope.experiment_info.description);

        var data = undefined;
        $modalInstance.close(data);

      }, function(data) {

        console.log("Could not update experiment data. " + data);

      });
      
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };


  });
