/**
 * The "focusAutofocus" adds focus when it is added to the DOM.
 */
/* global angular, module, moduleName, utils */
module.directive('focusAutofocus', function (focusManager, focusQuery) {
    var focusEls = [];
    var focusElsCount = 0;
    var unwatchChanges;
    var timer;

    function reset() {
        // reset everything
        unwatchChanges = null;
        focusElsCount = 0;
        clearInterval(timer);
    }

    function focus(el) {
        // set focus on the element using focus manager
        focusManager.focus(el);
        // also set focus directly on on element
        el.focus();
    }

    return {
        scope: true,
        link: function (scope, element, attr) {
            // get current element
            var el = element[0];
            // if there is an autofocus
            // get focus index
            var focusIndex = !attr.focusAutofocus ? 0 : parseInt(attr.focusAutofocus, 10);
            // index this element
            focusEls[focusIndex] = el;
            // increment count (used to verify that all elements have been compiled)
            focusElsCount += 1;
            // if se haven't created an unwatch
            if (!unwatchChanges) {
                // create an unwatch
                unwatchChanges = scope.$watch(function () {
                    // once watch has been invoked, unwatch immediately
                    unwatchChanges();
                    // once digest occurs, only try 10 times
                    var tries = 0, maxTries = 1000;
                    // create interval
                    timer = setInterval(function () {
                        // only loop while tries is less than max
                        if (tries < maxTries) {
                            // any items that are set as autofocus
                            var len = focusEls.length;
                            // loop through them
                            for (var i = 0; i < len; i += 1) {
                                // get current element
                                el = focusEls[i];
                                // if element is visible
                                if (focusQuery.isVisible(el)) {
                                    // reset everything
                                    reset();
                                    setTimeout(focus, 100, el);
                                    // do not continue
                                    break;
                                }
                            }
                            // increment tries
                            tries += 1;
                        } else {

                        }
                    }, 100);
                });
            }

            scope.$on("$destroy", function () {
                reset();
            });
        }
    };
});

