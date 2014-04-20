'use strict';

angular
  .module('malignerViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider, $locationProvider) {

    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/queries', {
        templateUrl: '/views/list_queries.html'
      })
      .when('/query/:queryId', {
        templateUrl: '/views/query.html',
        controller: 'QueryCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    //$locationProvider.html5Mode(true);

  });
