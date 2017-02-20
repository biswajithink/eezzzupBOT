/* global angular, module, utils, moduleName */
module.directive('focusHighlight', function (focusManager) {

    function getOffsetRect(elem) {
        // (1) get bounding rect
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        // (2) get scroll offset
        //var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        //var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        // (3) get position offset
        var clientTop = docElem.clientTop || body.clientTop || 0;
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;

        // (4) calculate offset
        //var top = box.top + scrollTop - clientTop;
        //var left = box.left + scrollLeft - clientLeft;
        var top = box.top - clientTop;
        var left = box.left - clientLeft;
        var pos =  {
            top: Math.round(top) - 4,
            left: Math.round(left) - 4,
            width: box.width + 8,
            height: box.height + 8
        };
        return pos;
    }

    var _updateDisplay = function (el, activeElement) {
        var style = el.style;
        if (activeElement && focusManager.canReceiveFocus(activeElement)) {
            var rect = getOffsetRect(activeElement);
            style.display = null;
            style.left = rect.left + 'px';
            style.top = rect.top + 'px';
            style.width = rect.width + 'px';
            style.height = rect.height + 'px';
        } else {
            style.display = 'none';
        }
    };

    var updateDisplay = utils.debounce(_updateDisplay, 10);

    return {
        scope: true,
        replace: true,
        link: function (scope, element, attrs) {
            var timer;
            var el = element[0];
            var targetEl;
            el.style.display = 'none';

            var onFocusTimer;
            var onFocus = function(evt) {
                clearTimeout(onFocusTimer);
                setTimeout(function(){
                    clearTimeout(timer);
                    targetEl = focusManager.getActiveElement() || evt.target;
                    element.removeClass('focus-highlight-inactive');
                    updateDisplay(el, targetEl);
                }, 10); // we delay it in case the activeElement is swapped out
            };

            var onBlur = function(evt) {
                timer = setTimeout(function () {
                    element.addClass('focus-highlight-inactive');
                    //updateDisplay(el);
                });
            };

            var updateTimer;
            var onUpdate = function () {
                element.addClass('focus-highlight-disabled');
                _updateDisplay(element[0], targetEl);
                clearTimeout(updateTimer);
                updateTimer = setTimeout(function () {
                    element.removeClass('focus-highlight-disabled');
                }, 10);
            };

            document.addEventListener('focus', onFocus, true);
            document.addEventListener('blur', onBlur, true);
            window.addEventListener('scroll', onUpdate);
            window.addEventListener('resize', onUpdate);

            scope.$on('$destroy', function(){
                document.removeEventListener('focus', onFocus, true);
                document.removeEventListener('blur', onBlur, true);
                window.removeEventListener('scroll', onUpdate);
                window.removeEventListener('resize', onUpdate);
            });
        },
        template: '<div class="focus-highlight"></div>'
    };
});