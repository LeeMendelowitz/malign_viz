'use strict';

angular.module('malignerViewerApp')
  .directive('map', function (mapDB) {
    return {
      templateUrl: '/views/map.html',
      restrict: 'E',
      scope: {
        map: '=mapData'
      },
      link: function postLink(scope, element, attrs) {

        console.log("scope: ", scope);
        console.log("have map: ", scope.map);

        var w = 1000;
        var h = 200;

        var barw = 20;
        var barh = 50;
        var barspacing = 2;
        var px_per_kb = 3.0;

        // Process fragments
        var processFragments = function(fragments) {

          var data = [];
          var last_pos = 0;
          for(var i = 0; i < fragments.length; i++) {
            var x = Math.round(last_pos + (i > 0 ? barspacing : 0));
            var w = Math.round(fragments[i]/1000.0*px_per_kb);

            var new_frag = { x: x,
                             w: w,
                             h: barh,
                             fragment: fragments[i]};
            data.push(new_frag);
            last_pos = x + w;
          }
          return data;
        };


        var drawMap = function() {

            if (!scope.map) {
              console.log('have no map data!');
              return;
            }

            var plot_data = processFragments(scope.map.fragments);

            var svg = d3.select(element[0]).select('.map_container')
                        .append('svg')
                        .attr('width', w)
                        .attr('height', h);

            var recs = svg.selectAll('rect').data(plot_data).enter()
                       .append('rect')
                       .attr('x', function(d, i) {
                         return d.x;
                       })
                       .attr('y', 0)
                       .attr('width', function(d) {
                         return d.w;
                       })
                       .attr('height', function(d) {
                        return d.h;
                      })
                      .on("mouseover", function(d) {
                        
                          //Get this bar's x/y values, then augment for the tooltip
                          var svgTop = svg.attr('y')
                          var xPosition = parseFloat(d3.select(this).attr("x")) + d.w/2;
                          var yPosition = parseFloat(d3.select(this).attr("y")) + d.h;

                          //Update the tooltip position and value
                          d3.select("#tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px");

                          scope.$apply(function () {
                            scope.tooltip = d;
                          });
                         
                          //Show the tooltip
                          d3.select("#tooltip").classed("hidden", false);

                      })
                      .on("mouseout", function() {
                        //Hide the tooltip
                        d3.select("#tooltip").classed("hidden", true);
                      });
        };

        scope.$watch('map', drawMap);

      }
    };
  });
