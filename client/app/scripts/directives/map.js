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
        scope.map = mapDB.getMap(attrs.mapName);
      }
    };
  });
