'use strict';

angular
  .module('malignerViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/alignments', {
        templateUrl: 'views/view_alignments.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
