'use strict';

/**
 * @ngdoc service
 * @name trackmanApp.userAPI
 * @description
 * # userAPI
 * Service in the trackmanApp. Responsible for querying
 * the api for user data.
 */
angular.module('malignerViewerApp')
  .service('api', ['$http', '$q', function ($http, $q) {

    var make_get_endpoint = function(url) {


      return function() {

        var deferred = $q.defer();

        $http.get(url).
          success(function(data, status, headers, config) {

              // this callback will be called asynchronously
              // when the response is available
              deferred.resolve(angular.fromJson(data));

          }).
          error(function(data, status, headers, config) {

              // called asynchronously if an error occurs
              // or server returns response with an error status.
              deferred.reject(data);

          });

        return deferred.promise;
      };

    };

    var make_post_endpoint = function(url) {


      return function(data) {

        var deferred = $q.defer();

        $http.post(url, data).
          success(function(data, status, headers, config) {

              // this callback will be called asynchronously
              // when the response is available
              deferred.resolve(angular.fromJson(data));

          }).
          error(function(data, status, headers, config) {

              // called asynchronously if an error occurs
              // or server returns response with an error status.
              deferred.reject(data);

          });

        return deferred.promise;
      };

    };


    this.get_experiments = make_get_endpoint('/api/experiments');

    this.delete_experiment = function(experiment_id) {
      var e = make_post_endpoint('/api/experiments/' + experiment_id + '/delete');
      return e();
    };

    this.get_experiment_info = function(experiment_id) {
      var e = make_get_endpoint('/api/experiments/' + experiment_id);
      return e();
    };

    this.get_experiment_queries = function(experiment_id) {
      var e = make_get_endpoint('/api/experiments/' + experiment_id + '/queries');
      return e();
    };

    this.get_experiment_references = function(experiment_id) {
      var e = make_get_endpoint('/api/experiments/' + experiment_id + '/references');
      return e();
    };

    this.update_experiment = function(experiment_id, data) {
      var e = make_post_endpoint('/api/experiments/' + experiment_id);
      return e(data);
    };



  }]);
