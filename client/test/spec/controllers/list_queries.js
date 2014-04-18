'use strict';

describe('Controller: ListQueriesCtrl', function () {

  // load the controller's module
  beforeEach(module('malignerViewerApp'));

  var ListQueriesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ListQueriesCtrl = $controller('ListQueriesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
