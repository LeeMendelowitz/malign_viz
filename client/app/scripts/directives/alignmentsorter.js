'use strict';

angular.module('malignerViewerApp')
  .directive('alignmentsorter', function () {
    return {
      templateUrl: '/views/alignment_sorter.html',
      restrict: 'E',
      scope: {
        'alignments' : '='
      },
      controller: function($scope) {
        $scope.alignmentSort = "rescaled_score";

        $scope.do_sort = function() {

          // Function to sort the alignment function
          if (!$scope.alignments) {
            return;
          }

          if ($scope.alignmentSort === 'rescaled_score') {
            
            $scope.alignments.sort(function(aln1, aln2) {
              return aln1.total_score_rescaled < aln2.total_score_rescaled ? -1 : 1;
            });

          } else if ($scope.alignmentSort === 'rescaled_sizing_score') {

            $scope.alignments.sort(function(aln1, aln2) {
              return aln1.rescaled_score.sizing_score < aln2.rescaled_score.sizing_score ? -1 : 1;
            });

          } else if ($scope.alignmentSort === 'ref_miss_score') {

            $scope.alignments.sort(function(aln1, aln2) {
              return aln1.score.ref_miss_score < aln2.score.ref_miss_score ? -1 : 1;
            });

          } else if ($scope.alignmentSort === 'total_log_likelihood') {

            $scope.alignments.sort(function(aln1, aln2) {
              return aln1.score.total_log_likelihood < aln2.score.total_log_likelihood ? -1 : 1;
            });

          }

          console.log('did sort by ' + $scope.alignmentSort + '. Alignments:', $scope.alignments);
        }
      },

      link: function postLink(scope, element, attrs) {

        // Register a watch on the scope's alignmentSort value
        scope.$watch('alignmentSort', scope.do_sort);
        
      }

    };
  });
