'use strict';

angular.module('malignerViewerApp')
  .service('mapDB', function mapDB($http, $q) {

    var query_db = {};
    var reference_db = {};

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

        var responsePromise = $http({method: 'GET', url: 'http://localhost:5000/api/references' })
          .
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

    self.getReferenceMap = function(mapName) {

      // Return a promise for retrieving the reference map.
      var deferred = $q.defer();

      // If we have a cached value, return it.
      var cached_map = reference_db && reference_db[mapName];
      if (cached_map) {
        deferred.resolve(Object.create(cached_map));
        return deferred.promise;
      }

      var responsePromise = $http({
             method: 'GET',
             url: 'http://localhost:5000/api/references/' + mapName
      })
      .success( function( data, status, headers, config ) {

        console.log("got reference map response");

        var refMap = data['reference_map'];
        if ( !refMap ) {
          // No reference map was returned.
          deferred.reject( "No reference map with id " + mapName );
          return;
        }

        reference_db[ refMap.name ] = refMap;
        deferred.resolve(Object.create(refMap));

      })
      .error( function( data, status, headers, config ) {
        console.log("Failed to retrieve reference maps!");
        deferred.reject("Error retrieving reference map from server.");
      });

      return deferred.promise;

    }

    //self.loadReferenceMaps();

    return self;

  });
