'use strict';

angular.module('malignerViewerApp')

  .controller('ListQueriesCtrl', function ($scope, $http) {

    $scope.query_ids = []

    $scope.getQueries = function() {

      console.log("Making get queries request...");
      $http({method: 'GET', url: 'http://localhost:5000/api/queries'}).
        success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
        console.log("Got data", data);
        $scope.query_ids = data.query_id;
      }).
      error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      });

    };

  });
