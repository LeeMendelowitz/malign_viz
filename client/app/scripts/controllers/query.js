'use strict';

angular.module('malignerViewerApp')

  .controller('QueryCtrl', function ($scope, $routeParams, $http, mapDB, $location, $anchorScroll) {

    $scope.routeParams = $routeParams;

    $scope.queryId = $routeParams.queryId;
    console.log('Have route params: ', $routeParams);

    $scope.status_message = 'Retrieving alignments...';


    $scope.scrollTo = function(id) {
      // Hack to get scrollTo work:
      // http://stackoverflow.com/a/15935517
      // 1. Set the hash.
      // 2. Call anchorScroll, which uses the hash.
      // 3. Reset the hash, to avoid a route change.
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      $location.hash(old);
    };


    $scope.getAlignments = function() {

      console.log('Getting alignments for query ' + $scope.queryId);
      $http({method: 'GET', url: 'http://localhost:5000/api/alignments/' + $scope.queryId}).
        success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available

        $scope.alignments = data.alignments;
        $scope.status_message = 'Retrieved ' + $scope.alignments.length + ' alignments.';
        console.log(data.alignments);
      }).
      error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
        $scope.status_message = 'Failed to retrieve alignments.';
      });
    };

    $scope.getQueryMap = function() {
      // Get the query Map from the server. Used cached map if we have it.

      var queryMap = mapDB.getMap($scope.queryId);

      if(queryMap) {
        console.log("loaded query map from cache.");
        $scope.queryMap = queryMap;
        return;
      }

      console.log('Getting query Map ' + $scope.queryId);
      $http({method: 'GET', url: 'http://localhost:5000/api/queries/' + $scope.queryId}).
        success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available

        $scope.queryMap = data.query_map;

        //console.log($scope.queryMap);
        mapDB.addMap($scope.queryMap);
      }).
      error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
        $scope.status_message = 'Failed to retrieve alignments.';
      });
    };
    
    $scope.getQueryMap();
    $scope.getAlignments();


  });




