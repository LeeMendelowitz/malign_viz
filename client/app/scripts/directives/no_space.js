'use strict';

function hasWhiteSpace(s) {
  return /\s/g.test(s);
};

angular.module('malignerViewerApp').directive('noSpace', function() {
  return {
    require: '^ngModel',
    restrict: 'A',
    link: function(scope, elm, attrs, ctrl) {

      ctrl.$validators.noSpace = function(modelValue, viewValue) {

        if (ctrl.$isEmpty(modelValue)) {
          // consider empty model valid
          return true;
        }

       if (hasWhiteSpace(viewValue)) {
          // it is not valid
          return false;
        }

        // it is valid
        return true;
      };

    }
  };
});