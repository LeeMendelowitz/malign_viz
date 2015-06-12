'use strict';

// This service will query data from the api (if necessary),
// cache responses in sessionStorage, and return
// promises for the data.
angular.module('malignerViewerApp')
  .service('experimentDataService', function experimentDataService($sessionStorage, api, $q) {

    var self = {};

    self._get_experiment = function(experiment_name) {
      var exp = $sessionStorage[experiment_name];
      if (!exp) {
        exp = {'name' : experiment_name,
               'query_maps' : {},
               'reference_maps' : {},
               'info' : {}
              }
        $sessionStorage[experiment_name] = exp; 
        return exp;
      } else {
        return exp;
      }
    };

    self._save_experiment = function(experiment_obj) {
      $sessionStorage[experiment_obj.name] = experiment_obj;
    };

    self.clearExperimentData = function(experiment_name) {
      delete $sessionStorage[experiment_name];
    };

    self.loadExperimentData = function(experiment_name) {

      // This will load all data for an experiment:
      // - query_maps
      // - reference_maps
      // - info

      var deferred = $q.defer();

      var exp = $sessionStorage[experiment_name];

      if(exp) {

        deferred.resolve(exp);

      } else {

        // Retrieve the data from the api.
        var experiment_info_promise = api.get_experiment_info(experiment_name);
        var query_promise = api.get_experiment_queries(experiment_name);
        var ref_promise = api.get_experiment_references(experiment_name);

        var exp = self._get_experiment(experiment_name);

        experiment_info_promise.then(function(experiment_info) {
          exp['info'] = experiment_info;
        });

        
        query_promise.then(function(data) {
          var query;
          var query_d = {};
          var queries = data.query_maps || [];
          for(var i = 0; i < queries.length; i++) {
            query = queries[i];
            query_d[query.name] = query;
          }
          exp['query_maps'] = query_d;
        });

        ref_promise.then(function(data) {
          var ref;
          var ref_d = {};
          var references = data.reference_maps || [];
          for(var i = 0; i < references.length; i++) {
            ref = references[i];
            ref_d[ref.name] = ref;
          }
          exp['reference_maps'] = ref_d;
        });

        // When all promises have been resolved, return the experiment data.
        $q.all([experiment_info_promise, query_promise, ref_promise]).then(function() {
          self._save_experiment(exp)
          deferred.resolve(exp);
        });

      }

      return deferred.promise;

    };



    //////////////////////////////////////////////////////
    // Functions for retrieving query maps.
    self.addQueryMap = function(experiment_name,  map) {
      var exp = self._get_experiment(experiment_name);
      exp['query_maps'][map.name] = map;
      self._save_experiment(exp);
    };

    self.addQueryMaps = function(experiment_name,  maps) {
      var exp = self._get_experiment(experiment_name);
      var i, map;
      for(i = 0; i < maps.length; i++) {
        map = maps[i];
        exp['query_maps'][map.name] = map;
      }
      self._save_experiment(exp);
    };

    self.removeQueryMap = function(experiment_name, mapName) {
      var exp = self._get_experiment(experiment_name);
      delete exp['query_maps'][mapName];
      self._save_experiment(exp);
      
    };

    self.getQueryMap = function(experiment_name, mapName) {
      var exp = self._get_experiment(experiment_name);
      return exp['query_maps'][mapName];
    };

    self.getQueryMaps = function(experiment_name) {
      var exp = self._get_experiment(experiment_name);
      return exp['query_maps'];
    };

    self.clearQueryMaps = function(experiment_name) {
      var exp = self._get_experiment(experiment_name);
      exp['query_maps'] = {};
      self._save_experiment(exp);
    };

    //////////////////////////////////////////////////

    self.addReferenceMap = function(experiment_name, map) {
      var exp = self._get_experiment(experiment_name);
      exp['reference_maps'][map.name] = map;
      self._save_experiment(exp);

    };

    self.addReferenceMaps = function(experiment_name, maps) {
      var exp = self._get_experiment(experiment_name);
      var i, map;
      for(i = 0; i < maps.length; i++) {
        map = maps[i];
        exp['reference_maps'][map.name] = map;
      }
      self._save_experiment(exp);
    };

    self.removeReferenceMap = function(experiment_name, mapName) {
      var exp = self._get_experiment(experiment_name);
      delete exp['reference_maps'][mapName];
      self._save_experiment(exp);
    };

    self.getReferenceMap = function(experiment_name, mapName) {
      var exp = self._get_experiment(experiment_name);
      return exp['reference_maps'][mapName];
    };

    self.getReferenceMaps = function(experiment_name) {
      var exp = self._get_experiment(experiment_name);
      return exp['reference_maps'];
    };

    self.clearReferenceMaps = function(experiment_name) {
      var exp = self._get_experiment(experiment_name);
      exp['reference_maps'] = {};
      self._save_experiment(exp);
    };


    return self;

  });
