'use strict';

angular.module('malignerViewerApp')
  .service('mapDB', function mapDB($http) {

    var query_db = {};
    var reference_db = undefined;

    var self = {};

    //////////////////////////////////////////////////////
    // Functions for retrieving query maps.
    self.addMap = function(map) {
      query_db[map.name] = map;
      console.log('adding map to mapDDB: ', map);
    };

    self.removeMap = function(map) {
      delete query_db[map.name];
    };

    self.getMap = function(mapName) {
      return query_db[mapName];
    };

    self.getMaps = function() {
      return query_db;
    };

    ///////////////////////////////////////////////////////
    // Functions for retrieving reference maps.
    self.loadReferenceMaps = function() {

      if (!reference_db) {

        console.log("requesting reference maps.");

        $http({method: 'GET', url: 'http://localhost:5000/api/references' }).
          success(function(data, status, headers, config) {

            console.log("got reference map response");

            reference_db = {};
            for(var i = 0; i < data.reference_maps.length; i++) {
              var refMap = data.reference_maps[i];
              reference_db[refMap.name] = refMap;
            }
        }).
        error(function(data, status, headers, config) {
          console.log("Failed to retrieve reference maps!");
        });
      }
      else {
        console.log('using cached reference maps.');
      }
    };

    self.getReferenceMaps = function() {
      return reference_db;
    };

    self.loadReferenceMaps();

    return self;

  });
