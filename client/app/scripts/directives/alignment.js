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
      link: function postLink(scope, element, attrs) {
      
        // Perhaps this code should move to a controller?
        // All we do as of now is make the referenceMap slice which
        // is part of the alignment available on the scope.


        if (!scope.alignment) {
          return;
        }

        scope.$watchCollection('[queryMap, alignment]', function() {

          var processRefMap = function (refMap) {

            if (!scope.alignment.ref_is_forward) {
              refMap.fragments.reverse(); 
            }

            // Set the slice of the reference map that is in the alignment.
            var matchedChunks = scope.alignment.matched_chunks;
            var firstChunk = matchedChunks[0];
            var lastChunk = matchedChunks[matchedChunks.length-1];
            var refFragsSubset = refMap.fragments.slice(firstChunk.ref_chunk.start, lastChunk.ref_chunk.end);

            
            var refMapSubset = { fragments : refFragsSubset };

            // Put the reference map data on the scope.
            scope.referenceMap = refMapSubset;
          }

          var refMapPromise = mapDB.getReferenceMap(scope.alignment.ref_id)
                      .then( function(refMap) {
                          processRefMap(refMap);
                      });
          });
      }

    };
  });
