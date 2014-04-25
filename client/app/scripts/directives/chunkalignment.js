'use strict';

angular.module('malignerViewerApp')
  .directive('chunkalignment', function () {
    return {
      templateUrl: '/views/chunkalignment.html',
      restrict: 'E',
      require: '^alignment',
      link: function postLink(scope, element, attrs) {

        //console.log('chunkalignment link function!');
        var setTooltipData = function(chunk, index) {

          var d = {};
          d.num_query_frags = chunk.query_chunk.fragments.length
          d.num_ref_frags = chunk.ref_chunk.fragments.length;
          d.chunk = chunk;
          d.index = index;

          scope.$apply(function() {
            scope.tooltipData = d;
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
          var hBar = 25; // height of fragment rectangle
          var hSpacing = 2; // spacing between matched chunk groups.
          var wSite = 2; // width of restriction site, in pixels.
          var missedSiteFill = 'red';
          var fillColors = ['steelblue', 'silver(16)'];

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

          var matchedChunksCumSum = [0];
          var matchedChunksCumSum = matchedChunksCumSum.concat(cumsum(matchedChunkSizes).slice(0,-1));
          var chunksGroupXOffsets = matchedChunksCumSum.map(function(s, i) {
            return xScale(s);
          });

          // D3 callback for drawing a matched_chunk.
          var drawMatchedChunk = function(matched_chunk, i) {

            // Make groups for the matched chunk
            var chunkGroup = d3.select(this);
            var chunkOffset = chunksGroupXOffsets[i];
            chunkGroup.attr('transform', 'translate(' + chunkOffset + ', 0)');

            var rChunk = matched_chunk.ref_chunk;
            var qChunk = matched_chunk.query_chunk;

            console.log('chunkOffset: ', chunkOffset);
            console.log('rScale: ', xScale(rChunk.size));
            console.log('qScale: ', xScale(qChunk.size));

            // Make groups for the query and the reference
            var qY = hBar + vSpacing;
            var rY = 0;
            var rGroup = chunkGroup.append('g')
                                   .attr('transform', 'translate(0,' + rY + ')');
            var qGroup = chunkGroup.append('g')
                                   .attr('transform', 'translate(0,' + qY + ')');

            // Draw the reference group.
            rGroup.append('rect').attr('width', xScale(rChunk.size))
                                 .attr('height', hBar)
                                 .attr('x', 0)
                                 .attr('y', 0)
                                 .attr('fill', function() {
                                  console.log('i: ', i, ' color: ', fillColors[i % fillColors.length]);
                                  return fillColors[i % fillColors.length];
                                 });



            // Draw interior missed sites.
            if (rChunk.fragments.length > 1) {
              var rSiteLocs = cumsum(rChunk.fragments).slice(0, -1);
              rGroup.selectAll('line').data(rSiteLocs)
                                      .enter()
                                      .append('line')
                                      .attr('x1', function(d) { return xScale(d); })
                                      .attr('x2', function(d) { return xScale(d); })
                                      .attr('y1', 0)
                                      .attr('y2', hBar)
                                      .attr('stroke', missedSiteFill)
                                      .attr('stroke-width', 1);
            }

            // Draw the query group.
            qGroup.append('rect').attr('width', xScale(qChunk.size))
                                 .attr('height', hBar)
                                 .attr('x', 0)
                                 .attr('y', 0)
                                 .attr('fill', function() {
                                  console.log('i: ', i, ' color: ', fillColors[i % fillColors.length]);
                                  return fillColors[i % fillColors.length];
                                 });

            // Draw interior missed sites.
            if (qChunk.fragments.length > 1) {
              var qSiteLocs = cumsum(qChunk.fragments).slice(0, -1);
              qGroup.selectAll('line').data(qSiteLocs)
                                      .enter()
                                      .append('line')
                                      .attr('x1', function(d) { return xScale(d); })
                                      .attr('x2', function(d) { return xScale(d); })
                                      .attr('y1', 0)
                                      .attr('y2', hBar)
                                      .attr('stroke', missedSiteFill)
                                      .attr('stroke-width', '2');
            }

            activateTooltip(chunkGroup, i);

          };

          // activate tooltip on a matched chunk node.
          var activateTooltip = function(chunkGroup, index) { 

            var elem = chunkGroup[0][0];
            var xPosition =  elem.getBoundingClientRect().left;


            chunkGroup.on("mouseover", function(d) {

              //Update the tooltip position and value

              tooltip
                .style("left", xPosition + "px")
                .style("top", 100 + "px");

              var matchedChunkData = d;
              setTooltipData(matchedChunkData, index);

              //Show the tooltip
              tooltip.classed("hidden", false);

            })
            .on("mouseout", function() {
              //Hide the tooltip
              tooltip.classed("hidden", true);
            });
          };

          // Draw each matched chunk.
          var container = d3.select(element[0]);

          var svg = container.append('svg')
                             .attr('width', plotw)
                             .attr('height', ploth);

          var tooltip = container.select('.mv-tooltip');

          var chunkArea = svg.append('g')
                             .attr('transform', 'translate(' + margin + ',' + margin + ')');

          var chunkGroups = chunkArea.selectAll('g')
                               .data(matchedChunks)
                               .enter()
                               .append('g')
                               .classed('matched-chunk', true)
                               .each(drawMatchedChunk);

        };


        scope.$watch('processedReference', draw_chunk_alignment, true);

      }
    };
  });
