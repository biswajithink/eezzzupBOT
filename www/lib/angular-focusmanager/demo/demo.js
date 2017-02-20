/* global angular */
var app = angular.module('app', ['fm']);
app.directive('main', function ($log, focusKeyboard) {
    return {
        link: function (scope) {
            scope.log = $log.log;

            scope.list = [1, 2, 3];

            scope.arrowKeysEnabled = false;
            scope.toggleArrowKeys = function () {
                if (scope.arrowKeysEnabled) {
                    focusKeyboard.disableArrowKeys();
                } else {
                    focusKeyboard.enableArrowKeys();
                }

                scope.arrowKeysEnabled = !scope.arrowKeysEnabled;
            }
        }
    };
});