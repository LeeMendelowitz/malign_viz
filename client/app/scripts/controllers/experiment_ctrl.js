'use strict';

angular.module('malignerViewerApp')

  .controller('experimentCtrl', function ($scope, $stateParams, $http, $location, $filter, $modal, api, ngTableParams, experimentDataService) {

    // Get the experiment name from the stateParams
    var experimentId = $stateParams.experimentId
    $scope.experimentId = experimentId;

    var aligned_queries;

    var experiment_data;
    var experiment_data_promise = experimentDataService.loadExperimentData(experimentId);
    experiment_data_promise.then(function(d) {
      experiment_data = d;
      $scope.experiment_info = experiment_data.info;
    });

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
          query_id: 'asc'
        }
      }, {
        total: function() { return 0; }, // length of data
        getData: function ($defer, params) {
          experiment_data_promise.then(function(experiment_data) {

            var data = experiment_data.info.aligned_queries || [];

            // use build-in angular filter
            var orderedData = params.sorting() ?
                    $filter('orderBy')(data, params.orderBy()) :
                    data;

            params.total = function() { return data.length;};

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          
          });
        }
    });

    $scope.open_edit_modal = function() {


      var modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/experiment_edit_modal.html',
        controller: 'experimentEditCtrl',
        size: 'lg',
        resolve: {
          experiment_info: function() {
            return experiment_data_promise.then(function(experiment_data) {
              return experiment_data.info;
            });
          }
        }
      });

      modalInstance.result.then(function (data) {
        // Do something with data
      }, function () {

      });

    };



  });
