'use strict';

angular.module('malignerViewerApp')

  .controller('ListQueriesCtrl', function ($scope, $http, $location, queryIdDB) {

    $scope.queryIds = [];
    $scope.queryMapName = '';

    $scope.getQueries = function() {

      var queryIds = queryIdDB.getIds();
      if (queryIds.length) {
        $scope.queryIds = queryIds;
        return queryIds;
      }

      console.log('Making get queries request...');

      $http({method: 'GET', url: 'http://localhost:8001/api/queries'}).
        success(function(data, status, headers, config) {
      // this callback will be called asynchronously
      // when the response is available
        console.log('Got data', data);
        $scope.queryIds = data.query_id;
        queryIdDB.setIds(data.query_id);
      }).
      error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      });

    };

    $scope.goToMap = function() {
      if ($scope.queryMapName) {
        var url = '/query/' + $scope.queryMapName;
        console.log('setting url: ', url);
        $location.path(url);
      }
    };

    //$scope.getQueries();

  });
