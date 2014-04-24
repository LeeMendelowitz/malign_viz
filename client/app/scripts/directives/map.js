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

        var plotw = 800;
        var ploth = 200;
        
        var barh = 50;
        var barspacing = 2;


        // Process fragments
        var processFragments = function(fragments) {

          var maxFragment = d3.max(fragments);
          var sumFragment = d3.sum(fragments);
          var paddingPx = barspacing * (fragments.length-1);
          var linearScale = d3.scale.linear().domain([0, sumFragment]).range([0, plotw-paddingPx]);


          var data = [];
          var last_pos = 0;
          for(var i = 0; i < fragments.length; i++) {
            var x = Math.round(last_pos + (i > 0 ? barspacing : 0));
            var w = linearScale(fragments[i]);
            var new_frag = { x: x,
                             w: w,
                             h: barh,
                             fragment: fragments[i]};
            data.push(new_frag);
            last_pos = x + w;
          }
          return data;
        };


        var drawMap = function(newVal, oldVal) {

            console.log("drawMap with newVal: ", newVal, ", oldVal: ", oldVal);
            if (!scope.map) {
              console.log('have no map data!');
              return;
            }

            var plotData = processFragments(scope.map.fragments);

            
            var mapContainer = d3.select(element[0]).select('.map-container');
            var tooltip = mapContainer.select('.mv-tooltip');

            

            var svg = mapContainer
                        .append('svg')
                        .attr('width', plotw)
                        .attr('height', ploth);

            var recs = svg.selectAll('rect').data(plotData).enter()
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
                        tooltip
                          .style("left", xPosition + "px")
                          .style("top", yPosition + "px");

                        scope.$apply(function () {
                          scope.tooltip = d;
                        });
                       
                        //Show the tooltip
                        tooltip.classed("hidden", false);

                      })
                      .on("mouseout", function() {
                        //Hide the tooltip
                        tooltip.classed("hidden", true);
                      });
        };

        scope.$watch('map', drawMap);

      }
    };
  });
