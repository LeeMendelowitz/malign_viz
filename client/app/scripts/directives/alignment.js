 'use strict';


angular.module('malignerViewerApp')
  .directive('alignment', function (mapDB) {
    return {
      templateUrl: '/views/alignment.html',
      restrict: 'E',
      scope: {
        queryMap: '=queryMap',
        alignment: '=alignmentData'
      },

      controller: function($scope, $element, $attrs) {

        $scope.loadReference = function() {
          // Get the reference map for the alignment.
          // Store the slice of the reference that participates in alignment on the scope.
          
          var ref_id = $scope.alignment.ref_id;
          var refMapPromise = mapDB.getReferenceMap($scope.alignment.ref_id);
          refMapPromise.then( function(refMap) {

              $scope.referenceMap = refMap;


              // Orient fragments with the alignment. If query
              // is aligned to reverse reference, we need to
              // reverse the reference fragments.
              var fragments = refMap.fragments.slice();
              if ( !$scope.alignment.ref_is_forward ) {
                fragments = fragments.reverse();
              }

              $scope.orientedReferenceFragments = fragments;

              // Set the slice of the reference map that is in the alignment.
              var matchedChunks = $scope.alignment.matched_chunks;
              var firstChunk = matchedChunks[0];
              var lastChunk = matchedChunks[matchedChunks.length-1];
              var refFragmentsSlice = fragments.slice(firstChunk.ref_chunk.start, lastChunk.ref_chunk.end);

              $scope.referenceFragmentsSlice = refFragmentsSlice;
              $scope.referenceMapSlice = {fragments: refFragmentsSlice};

              addInteriorFragments();

          });
        };

        var addInteriorFragments = function() {
          // Process the matched chunks and add interior fragments.

          var matchedChunks = $scope.alignment.matched_chunks;

          angular.forEach(matchedChunks, function(chunk) {
            chunk.ref_chunk.fragments = $scope.orientedReferenceFragments.slice(chunk.ref_chunk.start, chunk.ref_chunk.end);
            chunk.query_chunk.fragments = $scope.queryMap.fragments.slice(chunk.query_chunk.start, chunk.query_chunk.end);
          });
        };

      },

      link: function link(scope, element, attrs) {
        scope.loadReference();
      }

    };
  });
