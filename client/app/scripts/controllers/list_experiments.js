'use strict';

angular.module('malignerViewerApp')
  .controller('ListExperimentsCtrl', function ($scope, api, $modal, $state) {


    api.get_experiments().then(function(data) {
      $scope.experiments = data.experiments || [];
    });

    $scope.go_to_experiment = function(experimentId) {
      $state.go('experiment.home', {experimentId: experimentId});
    };

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
          experiment_info: function() {
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
