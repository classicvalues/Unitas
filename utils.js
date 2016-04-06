'use strict';

/**
 * Define a generic event handler that triggers a given action and then cancels the event altogether.
 *
 * @param {Function} action - an operation to complete, a callback.
 * @returns {Function} - the resulting event handler.
 */

const buildHandler = function(action) {
    return function(event) {
        if (event && event.preventDefault)
            event.preventDefault();
        if (action && 'function' === typeof action)
            action.call(this, event);
        return false;
    };
};

// @TODO: prevent handlers being fired too often (Walsh blog).
