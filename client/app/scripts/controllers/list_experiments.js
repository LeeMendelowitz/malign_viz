'use strict';

angular.module('malignerViewerApp')
  .controller('ListExperimentsCtrl', function ($scope, api, $modal) {


    api.get_experiments().then(function(data) {
      $scope.experiments = data.experiments || [];
    });

    $scope.open_edit_modal = function(experiment) {

      $scope.experiment = experiment;
      
      console.log("opening with experiment: ", experiment);

      var my_experiment = experiment;

      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/experiment_edit_modal.html',
        controller: 'experimentEditCtrl',
        size: 'lg',
        resolve: {
          experiment: function() {
            return $scope.experiment;
          }
        }
      });

      modalInstance.result.then(function (data) {
        // Do something with data
      }, function () {

      });


    };

  });
