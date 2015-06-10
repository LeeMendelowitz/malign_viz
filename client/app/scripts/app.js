'use strict';

var app = angular
  .module('malignerViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ngStorage',
    'ngRoute',
    'ui.bootstrap'
  ]);
  // .config(function ($routeProvider, $locationProvider) {

  //   $routeProvider
  //     .when('/', {
  //       templateUrl: '/views/main.html',
  //       controller: 'MainCtrl'
  //     })
  //     .when('/experiments', {
  //       templateUrl: '/views/experiments.html',
  //       controller: 'ListExperimentsCtrl'
  //     })
  //     .when('/queries', {
  //       templateUrl: '/views/list_queries.html'
  //     })
  //     .when('/query/:queryId', {
  //       templateUrl: '/views/query.html',
  //       controller: 'QueryCtrl'
  //     })
  //     .otherwise({
  //       redirectTo: '/'
  //     });

  //   //$locationProvider.html5Mode(true);

  // });

app.run(
  [ '$rootScope', '$state', '$stateParams', '$sessionStorage',
    function ($rootScope,   $state,   $stateParams, $sessionStorage) {

      // It's very handy to add references to $state and $stateParams to the $rootScope
      // so that you can access them from any scope within your applications.For example,
      // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
      // to active whenever 'contacts.list' or one of its decendents is active.
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.sessionStorage = sessionStorage;

    }
  ]
);

/////////////////////////////////////////////////////////////////////////////
// Define Routes
app.config(
  ['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise('/experiments');

      $stateProvider
        .state('experiments', {
          url: '/experiments',
          templateUrl: '/views/experiments.html',
          controller: 'ListExperimentsCtrl'
        });

      // $stateProvider
      //   .state('loading', {
      //     parent: 'site',
      //     templateUrl: '/views/loadingdata.html',
      //     controller: 'LoadDataCtrl',
      //     data: {
      //       requireLogin: true
      //     }
      //   })
      //   .state('teams', {   
      //     parent: 'site',                 
      //     url: '/teams',
      //     templateUrl: '/views/teams.html',
      //     controller: 'TeamCtrl',
      //     data : {
      //       requireLogin : true
      //     }
      //   })
      //   .state('fxboxscores', {
      //     parent: 'site',
      //     url: '/fxboxscores',
      //     abstract: true,
      //     template: '<div ui-view></div>',
      //   })
      //   .state('fxboxscores.list', {
      //     url: '/',
      //     templateUrl: '/views/fxboxscores_list.html',
      //     controller: 'FxBoxscoresCtrl',
      //     data: {
      //       requireLogin: true
      //     }
      //   })
      //   .state('fxboxscores.detail', {
      //     url: '/detail/:game_id',
      //     templateUrl: '/views/fxboxscores_detail.html',
      //     controller: 'FxBoxscoresDetailCtrl',
      //     data: {
      //       requireLogin: true
      //     }
      //   })
      //   .state('pitchers.detail', {          
      //     url: '/detail/:pitcherId',
      //     views: {
      //       "detail" : {
      //         templateUrl: '/views/pitchermain.html',
      //         controller: 'PitcherpageCtrl'
      //       }
      //     }
      //   });

    }

  ]);
