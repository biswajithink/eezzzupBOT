/* global angular, module, utils, moduleName, consts */
module.directive('focusGroup', function (focusManager, focusQuery, focusDispatcher, focusKeyboard) {

    var groupId = 1, // unique id counter for groups
        elementId = 1, // unique id counter for selectable elements
        dispatcher = focusDispatcher(), // general reference to dispatcher
        delay = 100; // amount of time to delay before performing an action

    var body = document.body;

    /**
     * Compile finds elements within a focus group and assigns them a unique element id
     * and a parent id (which references the group they belong to). If no tab index is
     * defined, then they will assigned a tabindex of -1 to prevent conflicts between
     * the browser's focus manager and this focus manager.
     * @param groupName
     * @param el
     */
    function compile(groupName, el) {
        var els, i, len, elementName;

        els = focusQuery.getElementsWithoutParents(el);
        len = els.length;
        i = 0;
        while (i < len) {
            elementName = elementId;
            focusQuery.setParentId(els[i], groupName);
            if(!focusQuery.getElementId(els[i])) {
                focusQuery.setElementId(els[i], elementName);
            }

            var tabIndex = focusQuery.getTabIndex(els[i]);
            if (tabIndex === undefined || tabIndex === null) {
                focusQuery.setTabIndex(els[i], -1); // elements in focus manager should not be tab enabled through browser
            }

            elementId += 1;
            i += 1;
        }

        els = focusQuery.getGroupsWithoutParentGroup(el);
        len = els.length;

        i = 0;
        while (i < len) {
            focusQuery.setParentGroupId(els[i], groupName);
            i += 1;
        }
    }

    function linker(scope, element, attr) {

        var el = element[0];
        var groupName = groupId++;
        var bound = false;
        var cacheHtml = '';
        var newCacheHtml = '';
        var tabIndex = el.getAttribute(consts.TAB_INDEX) || 0;
        var outOfBody = false;
        var focusInOff, focusEnabledOff, disabledOff;

        function init() {
            scope.$on('focus::' + groupName, function () {
                compile(groupName, el);
            });

            if (!focusQuery.getParentGroupId(el)) { // this is an isolate focus group

                cacheHtml = el.innerHTML;

                el.setAttribute(consts.TAB_INDEX, tabIndex);

                scope.$watch(utils.debounce(function () {
                    newCacheHtml = el.innerHTML;
                    if (cacheHtml !== newCacheHtml) {
                        var els = el.querySelectorAll('[' + consts.FOCUS_GROUP + ']');
                        var i = els.length, groupId;
                        while (i) {
                            i -= 1;
                            groupId = els[i].getAttribute(consts.FOCUS_GROUP_ID);
                            scope.$broadcast("focus::" + groupId);
                        }
                        cacheHtml = newCacheHtml;
                    }
                    compile(groupName, el);
                }, delay));

                focusInOff = dispatcher.on('focusin', utils.debounce(function (evt) {
                    // if group contains target then bind keys
                    if (focusQuery.contains(el, evt.newTarget)) {
                        if (bound === false) {
                            bound = true;
                            scope.$broadcast('bindKeys', groupName);
                        }
                    } else {
                        if (bound === true) {
                            bound = false;
                            scope.$broadcast('unbindKeys');
                        }
                    }
                }, delay));

                focusEnabledOff = dispatcher.on('enabled', function (evt) {
                    var direction = focusKeyboard.direction;
                    if (document.activeElement === el) {
                        if (direction === 'prev') {
                            focusManager.findPrevChildGroup(groupName);
                        } else {
                            focusManager.findNextElement(groupName);
                        }
                    }

                    if (document.activeElement === el || focusQuery.contains(el, document.activeElement)) {
                        el.removeAttribute(consts.TAB_INDEX);
                    } else {
                        el.setAttribute(consts.TAB_INDEX, tabIndex);
                    }

                });

                disabledOff = dispatcher.on('disabled', function () {
                    setTimeout(function () {
                        if (document.activeElement === el || focusQuery.contains(el, document.activeElement)) {
                            el.removeAttribute(consts.TAB_INDEX);
                        } else {
                            el.setAttribute(consts.TAB_INDEX, tabIndex);
                        }
                    });
                });
            }
        }

        function onFocus(evt) {
            if (outOfBody) {
                focusKeyboard.watchNextTabKey(groupName);
                scope.activeElement = null;
                outOfBody = false;
            } else {
                focusManager.enable();
            }
        }

        // needed when the focus leaves the document area
        function onDocumentBlur(evt) {
            // we have to wait on the blur to see if the active element is
            setTimeout(function () {
                if (document.activeElement === body) {
                    outOfBody = true;
                }
            });
        }

        el.addEventListener('focus', onFocus, true);
        document.addEventListener('blur', onDocumentBlur, true);

        scope.$on('focus::repeat', function (evt) {
            evt.stopPropagation();
            compile(groupName, el);
        });

        focusQuery.setGroupId(el, groupName);

        // Wait until after digest cycle has ended before initializing and compiling group
        scope.$$postDigest(function(){
            init();
            compile(groupName, el);
        });

        scope.$on('$destroy', function () {
            if (focusEnabledOff) {
                focusEnabledOff();
            }
            if (focusInOff) {
                focusInOff();
            }
            if (disabledOff) {
                disabledOff();
            }
            el.removeEventListener('focus', onFocus, true);
            document.removeEventListener('blur', onDocumentBlur, true);
        });
    }

    return {
        link: linker
    };

});