'use strict';

angular.module('malignerViewerApp')
  .controller('ListExperimentsCtrl', function ($scope, api, $modal, $state, experimentDataService) {


    api.get_experiments().then(function(data) {
      $scope.experiments = data.experiments || [];
    });

    $scope.go_to_experiment = function(experimentId) {
      $state.go('experiment.home', {experimentId: experimentId});
    };

    $scope.delete_experiment = function(experimentId) {
      
      api.delete_experiment(experimentId).then(function() {
        experimentDataService.clearExperimentData(experimentId);
        $scope.experiments = $scope.experiments.filter(function(e) {return e.name !== experimentId; });
      });

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


    $scope.open_create_modal = function() {

      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/experiment_create_modal.html',
        controller: 'experimentCreateCtrl',
        size: 'lg'
      });

      modalInstance.result.then(function (data) {
        // Do something with data
      }, function () {

      });


    };


  });
