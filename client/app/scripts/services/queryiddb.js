'use strict';

angular.module('malignerViewerApp')
  .service('queryIdDB', function queryIdDB() {

    var map_ids = [];

    var self = {};

    self.setIds = function(ids) {
      map_ids = ids
    };

    self.getIds = function() {
      return map_ids;
    };

    return self;

  });
