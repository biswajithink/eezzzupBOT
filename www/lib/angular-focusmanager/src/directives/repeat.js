/* global angular, module, moduleName, utils */
module.directive('focusRepeat', function () {
    return {
        scope: true,
        link: function (scope) {
            if (scope.$last) {
                scope.$emit('focus::repeat');
            }
        }
    };
});

/* global angular, module, moduleName, utils */
module.directive('ngRepeat', function () {
    return {
        scope: true,
        link: function (scope) {
            if (scope.$last) {
                scope.$emit('focus::repeat');
            }
        }
    };
});