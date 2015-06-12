'use strict';

var app = angular
  .module('malignerViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ngStorage',
    'ngRoute',
    'ui.bootstrap',
    'ngTable'
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

      $urlRouterProvider.otherwise('/experiments/list');

      $stateProvider
        .state('experiments', {
          url: '/experiments',
          abstract: true,
          template: '<ui-view/>'
        })
        .state('experiments.list', {
          url: '/list',
          templateUrl: '/views/experiments.html',
          controller: 'ListExperimentsCtrl'
        })
        .state('experiment', {
          url: '/experiment/:experimentId',
          abstract: true,
          template: "<ui-view/>",
          resolve: {
            experimentId : function($stateParams) {
              return $stateParams.experimentId;
            }
          }
        })
        .state('experiment.home', {
          url: '/',
          templateUrl: '/views/experiment_home.html',
          controller: 'experimentCtrl'
        })
        .state('experiment.query', {
          url: '/query/:queryId',
          templateUrl: '/views/experiment_query.html',
          controller: 'QueryCtrl',
          resolve: {
            'experimentData' : function(experimentDataService, $stateParams) {
              return experimentDataService.loadExperimentData($stateParams.experimentId);
            },
            'queryId' : function($stateParams) {
              return $stateParams.queryId;
            },
            'alignments' : function($stateParams, $q, $http) {

              var deferred = $q.defer();

              $http({method: 'GET', url: '/api/experiments/' + $stateParams.experimentId + '/alignments/' + $stateParams.queryId}).
                success(function(data, status, headers, config) {

                // this callback will be called asynchronously
                // when the response is available
                var alignments = data.alignments || [];

                // Sort by alignment score and add alignment ranks.
                alignments.sort(function(a1, a2) { return a1.total_score_rescaled - a2.total_score_rescaled; });

                for(var i = 0; i < alignments.length; i++) {
                  alignments[i]['aln_rank'] = i + 1;
                }

                deferred.resolve(alignments);

              }).error(function(data) {
                console.log("ERROR! ", data);
              });

              return deferred.promise;
            }
          }
        })
        .state('experiment.query.alignment', {
          url: '/alignment/:alnRank',
          templateUrl: '/views/experiment_query_alignments.html',
          controller: function(experimentId, queryId, experimentData, $stateParams, $scope) {

            // Call a function published on the experimentQuery controller
            // This will set the active alignment
            $scope.setActiveAlignment($stateParams.alnRank);

          }
        });
        // .state('experiment.query.aln', {
        //   url: '/alignment/:alnRank',


        // });

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
