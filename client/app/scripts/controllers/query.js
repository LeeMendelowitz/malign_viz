'use strict';

angular.module('malignerViewerApp')

  .controller('QueryCtrl', function ($scope, $stateParams, $http, $q, $filter, $state, experimentDataService,
      $location, $anchorScroll, experimentData, ngTableParams, queryId, experimentId, alignments) {

    $scope.queryId = queryId;
    $scope.experimentId = experimentId;
    $scope.status_message = 'Retrieving alignments...';
    $scope.experimentData = experimentData;
    $scope.queryMap = experimentDataService.getQueryMap($scope.experimentId, $scope.queryId);
    $scope.alignments = alignments;

    $scope.active_alignments = [];

    $scope.alignmentTableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,           // count per page
        sorting: {
          aln_rank: 'asc'
        }
      }, {
        total: function() { return 0; }, // length of data
        getData: function ($defer, params) {

            var data = alignments;

            // use build-in angular filter
            var orderedData = params.sorting() ?
                    $filter('orderBy')(data, params.orderBy()) :
                    data;

            params.total = function() { return data.length;};

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          
        }
    });

    $scope.setActiveAlignment = function(aln_rank) {

      if(!aln_rank) {
        $scope.active_alignments = [];
        return;
      }
      // Select the 1-based aln_rank ranked alignment
      // or all alignments if aln_rank === 'all'.
      if (aln_rank === 'all') {
        $scope.active_alignments = $scope.alignments;
      } else {
        $scope.active_alignments = [$scope.alignments[aln_rank - 1]];
      }

      console.log('Active alignments: ', $scope.active_alignments);

      $state.go('experiment.query.alignment', {experimentId: $stateParams.experimentId, queryId: $stateParams.queryId, alnRank: aln_rank});

    };


  });




