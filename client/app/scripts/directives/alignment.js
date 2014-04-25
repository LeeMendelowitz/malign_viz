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

        // Add a flag to the scope to indicate that we have
        // processed the referenced.
        $scope.processedReference = 0;

        $scope.loadReference = function() {

          // Get the reference map for the alignment.
          // Store the slice of the reference that participates in alignment on the scope.
          var ref_id = $scope.alignment.ref_id;
          var refMapPromise = mapDB.getReferenceMap($scope.alignment.ref_id);
          refMapPromise.then( function(refMap) {

                $scope.referenceMap = refMap;

                console.log('load reference, $scope.$$phase: ', $scope.$$phase);

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

                $scope.processedReference = $scope.processedReference + 1;
                console.log('processedReference: ', $scope.processedReference);

          });


      
        };

        $scope.getReferenceMap = function() {
          return $scope.referenceMap;
        };

        $scope.getAlignment = function() {
          console.log('alignment controller getAlignment func');
          return $scope.alignment;
        };

        $scope.getQueryMap = function() {
          return $scope.queryMap;
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

        //console.log("alignment link function!");
        scope.$watch('alignment', function() {
          scope.loadReference();
        });

      }

    };
  });
