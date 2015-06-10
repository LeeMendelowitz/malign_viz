'use strict';

angular.module('malignerViewerApp')
  .controller('experimentEditCtrl', function ($scope, api, $modalInstance, experiment) {
    
    console.log('model ctrl: ', experiment);
    $scope.experiment = experiment;
    $scope.experiment_form = angular.copy($scope.experiment);

    $scope.update = function(experiment) {

      api.update_experiment(experiment.name, experiment).then(function() {

        // Update the values in the offical copy of the experiment
        angular.extend($scope.experiment, experiment);
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
