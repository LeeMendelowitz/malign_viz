 'use strict';


angular.module('malignerViewerApp')
  .directive('alignment', function (experimentDataService) {
    return {
      templateUrl: '/views/alignment.html',
      restrict: 'E',
      scope: {
        queryMap: '=queryMap',
        alignment: '=alignmentData',
        experimentId: '='
      },

      controller: function($scope, $element, $attrs, $window) {

        // Add a flag to the scope to indicate that we have
        // processed the referenced.
        $scope.processedReference = 0;

        $scope.loadReference = function() {

          // Get the reference map for the alignment.
          // Store the slice of the reference that participates in alignment on the scope.
          var ref_id = $scope.alignment.ref_id;
          var refMap = experimentDataService.getReferenceMap($scope.experimentId, $scope.alignment.ref_id);

          $scope.referenceMap = refMap;
          var refFragments = refMap.fragments.slice(); 
          $scope.refFragments = refFragments;

          // Set the slice of the reference map that is in the alignment.
          var matchedChunks = $scope.alignment.rescaled_matched_chunks;
          var firstChunk = matchedChunks[0];
          var lastChunk = matchedChunks[matchedChunks.length-1];
          var refFragmentsSlice = refFragments.slice(firstChunk.ref_chunk.start, lastChunk.ref_chunk.end);

          $scope.referenceFragmentsSlice = refFragmentsSlice;
          $scope.referenceMapSlice = {refFragments: refFragmentsSlice};

          addInteriorFragments();
          applyQueryScalingFactor();

          $scope.processedReference = $scope.processedReference + 1;

          $scope.firstChunk = firstChunk;
          $scope.lastChunk = lastChunk;

      
        };

        var applyQueryScalingFactor = function() {
          // Multiply query chunk sizes by the query scaling factor;

          var query_scaling_factor = $scope.alignment.query_scaling_factor || 1.0;
          var matchedChunks = $scope.alignment.matched_chunks;
          var i;
  
          angular.forEach(matchedChunks, function(chunk) {

            // Scale the query chunk size
            chunk.query_chunk.size_scaled = chunk.query_chunk.size * query_scaling_factor;

            // Scaling the interior fragment sizes
            for (i = 0; i < chunk.query_chunk.fragments.length; i++) {
              chunk.query_chunk.scaled_fragments = chunk.query_chunk.fragments.map( function(frag) {
                return frag * query_scaling_factor;
              })
            }

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
    
          angular.forEach($scope.alignment.matched_chunks, function(chunk) {
            chunk.ref_chunk.fragments = $scope.refFragments.slice(chunk.ref_chunk.start, chunk.ref_chunk.end);
            chunk.query_chunk.fragments = $scope.queryMap.fragments.slice(chunk.query_chunk.start, chunk.query_chunk.end);
          });

          angular.forEach($scope.alignment.rescaled_matched_chunks, function(chunk) {
            chunk.ref_chunk.fragments = $scope.refFragments.slice(chunk.ref_chunk.start, chunk.ref_chunk.end);
            chunk.query_chunk.fragments = $scope.queryMap.fragments
              .slice(chunk.query_chunk.start, chunk.query_chunk.end)
              .map(function(frag) { 
                return frag * $scope.alignment.query_scaling_factor;
              });
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
