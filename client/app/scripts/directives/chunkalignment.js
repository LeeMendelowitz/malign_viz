'use strict';

angular.module('malignerViewerApp')
  .directive('chunkalignment', function () {
    return {
      templateUrl: '/views/chunkalignment.html',
      restrict: 'E',
      require: '^alignment',
      link: function postLink(scope, element, attrs) {


        var setTooltipData = function(data, index) {

          var d = {};
          d.num_query_frags = data.queryChunk.fragments.length;
          d.num_ref_frags = data.refChunk.fragments.length;
          d.query_chunk = data.queryChunk;
          d.ref_chunk = data.refChunk;
          d.index = index;

          scope.$apply(function() {
            scope.tooltipData = d;
            console.log(scope.tooltipData);
          });

        };

        var draw_chunk_alignment = function() {

          var alignment_data = scope.alignment;

          console.log('chunkalignment has alignment data: ', alignment_data);

          if (!alignment_data) {
            return;
          }

          //console.log('chunkalignment has alignment data with matched chunks: ', alignment_data.matched_chunks);

          var first_chunk = alignment_data.matched_chunks[0];
          console.log('first chunk: ', first_chunk);
          if (! first_chunk.ref_chunk.fragments) {
            console.log('chunkalignment has alignment data but no fragment data: ',
                        alignment_data.matched_chunks);

            return;
          }

          console.log('chunkalignment has alignment data and fragment data');

          var plotw = 800;
          var ploth = 200;
          var margin = 5;
          
          var vSpacing = 10; // vert. spacing betweeen query and reference fragments
          var vSpacingText = 50; // vert. spacing for chunk size labels
          var labelSize = 20;
          var hBar = 25; // height of fragment rectangle
          var hSpacing = 2; // spacing between matched chunk groups.
          var wSite = 2; // width of restriction site, in pixels.
          var missedSiteFill = 'red';
          var chunkFillColors = ['steelblue', 'silver(16)'];

          // Compute the length of chunks in the alignment in bp.
          var matchedChunks = alignment_data.matched_chunks;
          var rSum = d3.sum(matchedChunks.map(function(c) { return c.ref_chunk.size; }));
          var qSum = d3.sum(matchedChunks.map(function(c) { return c.query_chunk.size; }));

          // Define cumulative sum function.
          var cumsum = function(a) {
            var s = 0;
            var r = [];
            for(var i = 0; i < a.length; i++) {
              s = s + a[i];
              r.push(s);
            }
            return r;
          };

          // Compute the svg x offsets of each matched chunk group;
          var matchedChunkSizes = matchedChunks.map(function(c) {
            return d3.max([c.ref_chunk.size, c.query_chunk.size]);
          });
          var numChunks = matchedChunks.length;

          var alignmentLengthBp = d3.sum(matchedChunkSizes);

          // Create a scale.
          var xScale = d3.scale.linear().domain([0, alignmentLengthBp]).range([0, plotw-2*margin]);

          ///////////////////////////////////////////////////////////
          // Prepare the data for d3.data(...)
          var matchedChunksCumSum = [0];
          var matchedChunksCumSum = matchedChunksCumSum.concat(cumsum(matchedChunkSizes).slice(0,-1));
          var chunkGroupXOffsets = matchedChunksCumSum.map(function(s, i) {
            return xScale(s);
          });
          var refChunks = matchedChunks.map(function(c) { return c.ref_chunk; });
          var queryChunks = matchedChunks.map(function(c) { return c.query_chunk;});

          var data = matchedChunks.map(function(c, i) {
            var d = {};
            d._chunk = c;
            d.queryChunk = c.query_chunk;
            d.refChunk = c.ref_chunk;
            d.score = c.score;
            d.xOffset = chunkGroupXOffsets[i]; // Placement in visualization
            d.chunkFillColor = chunkFillColors[ i % chunkFillColors.length ];
            d.queryInteriorSiteLocs = cumsum(c.query_chunk.fragments).slice(0, -1); // Site locations in bp
            d.refInteriorSiteLocs = cumsum(c.ref_chunk.fragments).slice(0, -1);
            d.widthPx = xScale(d.queryChunk.size > d.refChunk.size ? d.queryChunk.size : d.refChunk.size);
            return d;
          });


          // Draw each matched chunk.
          var container = d3.select(element[0]);

          var svg = container.append('svg')
                             .attr('width', plotw)
                             .attr('height', ploth)
                             .classed('chunk-alignment', true)
                             .on('click', function() {
                              console.log('svg click!', arguments, ' this: ', this);
                             });

          var tooltip = container.select('.mv-tooltip');

          var chunkArea = svg.append('g')
                             .attr('transform', 'translate(' + margin + ',' + margin + ')');

          var chunkGroups = chunkArea.selectAll('g.matched-chunk')
                               .data(data)
                               .enter()
                               .append('g')
                               .attr('transform', function(d) {
                                  return 'translate(' + d.xOffset + ',0)';
                               })
                               .classed('matched-chunk', true);

          // Add click event listener
          chunkGroups.on('mouseover', function(d, index) {

              var matchedChunkData = d;
              setTooltipData(matchedChunkData, index);

              //Show the tooltip
              tooltip.classed('hidden', false);

          });


          var queryChunks = chunkGroups.append('g')
                               .classed('query-chunk', true)
                               .attr('transform', 'translate(0,' + (hBar + vSpacing + vSpacingText) + ')');

          var queryFragmentGroups = queryChunks.append('g')
                                            .attr('transform', function(d, i) {
                                                // right align the first fragment
                                                var tx =  (i === 0) ?
                                                 d.widthPx - xScale(d.queryChunk.size) : 0;
                                                var ty = 0;
                                                return 'translate(' + tx + ',' + ty + ')';
                                            });

          var queryFragments = queryFragmentGroups.append('rect')
                               .attr('width', function(d, i) {
                                return xScale(d.queryChunk.size);
                               })
                               .attr('x', 0)
                               .attr('y', 0)
                               .attr('height', hBar)
                               .attr('fill', function(d, i) {
                                return d.chunkFillColor;
                               });

          var queryInteriorSites = queryFragmentGroups.selectAll('line')
                                              .data(function(d) { 
                                                return d.queryInteriorSiteLocs; 
                                              })
                                              .enter()
                                              .append('line')
                                              .attr('x1', function(d) { 
                                                return xScale(d); })
                                              .attr('x2', function(d) { 
                                                return xScale(d); })
                                              .attr('y1', 0)
                                              .attr('y2', hBar)
                                              .classed('missed-site', true);

          var queryLabels = queryChunks.append('text')
                                       .text( function(d) { 
                                         return (d.queryChunk.size/1000.0).toFixed(2);
                                       })
                                       .classed('chunk-label query-label', true)
                                       .attr('x', function(d) {
                                          return d.widthPx/2.0;
                                       })
                                       .attr('y', hBar)
                                       .attr('dy', function(d,i) {
                                        var offset = -(1.0 * (i % 3)).toFixed(2);
                                        return offset + 'em';
                                       })
                                       .attr('fill', function(d, i) {
                                          return d.chunkFillColor;
                                       });

          var refChunks = chunkGroups.append('g')
                               .classed('ref-chunk', true);

                               

          var refFragmentGroups = refChunks.append('g')
                                          .attr('transform', function(d, i) {
                                              // right align the first fragment
                                              var tx =  (i === 0) ?
                                               d.widthPx - xScale(d.refChunk.size) : 0;
                                              var ty = vSpacingText;
                                              return 'translate(' + tx + ',' + ty + ')';
                                          });

          var refFragments = refFragmentGroups.append('rect')
                               .attr('width', function(d, i) {
                                return xScale(d.refChunk.size);
                               })
                               .attr('y', 0)
                               .attr('y', 0)
                               .attr('height', hBar)
                               .attr('fill', function(d, i) {
                                return d.chunkFillColor;
                               });

          var refInteriorSites = refFragmentGroups.selectAll('line')
                                          .data(function(d) { 
                                            return d.refInteriorSiteLocs; 
                                          })
                                          .enter()
                                          .append('line')
                                          .attr('x1', function(d) { 
                                            return xScale(d); })
                                          .attr('x2', function(d) { 
                                            return xScale(d); })
                                          .attr('y1', 0)
                                          .attr('y2', hBar)
                                          .classed('missed-site', true);

          var refLabels = refChunks.append('text')
                             .text( function(d) { 
                               return (d.refChunk.size/1000.0).toFixed(2);
                             })
                             .classed('chunk-label ref-label', true)
                             .attr('x', function(d) {
                                return d.widthPx/2.0;
                             })
                             .attr('y', vSpacingText)
                             .attr('dy', function(d,i) {
                              var offset = -(1.0 * (i % 3)).toFixed(2);
                              return offset + 'em';
                             })
                             .attr('fill', function(d, i) {
                                return d.chunkFillColor;
                             });

        };

        scope.$watch('processedReference', draw_chunk_alignment, true);

      }
    };
  });
