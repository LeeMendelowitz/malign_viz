'use strict';

angular.module('malignerViewerApp')
  .service('mapDB', function mapDB() {

    // AngularJS will instantiate a singleton by calling "new" on this function

    var db = {};

    var self = {};

    self.addMap = function(map) {
      db[map.name] = map;
      console.log('adding map to mapDDB: ', map);
    };

    self.removeMap = function(map) {
      delete db[map.name];
    };

    self.getMap = function(mapName) {
      return db[mapName];
    };

    self.getMaps = function() {
      return db;
    };

    return self;

  });
