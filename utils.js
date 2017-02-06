'use strict';

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Define a generic event handler that triggers a given action and then cancels the event altogether.
 *
 * @param {Function} action - an operation to complete, a callback.
 * @returns {Function} - the resulting event handler.
 */

var buildHandler = function(action) {
    return function(event) {
        if (event && event.preventDefault)
            event.preventDefault();
        if (action && 'function' === typeof action)
            action.call(this, event);
        return false;
    };
};

/**
 * @TODO
 */

var abbreviateGroupName = function(name) {
    var REGEX_BG = /business\s+group$/i,
        REGEX_CG = /community\s+group$/i,
        REGEX_IG = /interest\s+group$/i,
        REGEX_WG = /working\s+group$/i,
        ABBR_BG = '<abbr title="Business Group">BG</abbr>',
        ABBR_CG = '<abbr title="Community Group">CG</abbr>',
        ABBR_IG = '<abbr title="Interest Group">IG</abbr>',
        ABBR_WG = '<abbr title="Working Group">WG</abbr>';
    var result = name.replace(REGEX_BG, ABBR_BG);
    result = result.replace(REGEX_CG, ABBR_CG);
    result = result.replace(REGEX_IG, ABBR_IG);
    result = result.replace(REGEX_WG, ABBR_WG);
    return result;
}

/**
 * Reduce a URI to its minimum expression, for easier comparison.
 *
 * This works heuristically; it strips a URI of the usual variants and converts it to lowercase.
 * Some chunks that are removed are: protocol, "www." at the beginning, "/" at the end.
 *
 * @param {String} uri - Original URI.
 * @returns {String} The "normalised", (probably) equivalent URI.
 */

var normaliseURI = function(uri) {

    var result = uri.trim(); // .toLowerCase();
    var matches = REGEX_URI.exec(result);

    if (matches && matches.length > 3) {
        result = matches[3];
    }

    return result;

};

/**
 * @TODO
 */

var getUrlVars = function() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('#')[0];
        hash = hash.split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
};

/**
 * @TODO
 */

var processURL = function() {
    var params = getUrlVars();
    if(params.f) {
        type = TYPE_FUNCTION;
        id = ('all' !== params.f) ? params.f : undefined;
    } else if(params.c) {
        if (params.g) {
            type = TYPE_CHARTER;
            id = {g: params.g, c: params.c};
        } else {
            window.alert('Error: to retrieve a charter, the ID of the group is needed too.')
            return false;
        }
    } else if(params.g) {
        type = TYPE_GROUP;
        id = ('all' !== params.g) ? params.g : undefined;
    } else if(params.v) {
        if (params.s) {
            type = TYPE_VERSION;
            id = {s: params.s, v: params.v};
        } else {
            window.alert('Error: to retrieve a version, the shortname of the spec is needed too.')
            return false;
        }
    } else if(params.s) {
        type = TYPE_SPEC;
        id = ('all' !== params.s) ? params.s : undefined;
    } else if(params.u) {
        type = TYPE_USER;
        id = params.u;
    } else if(params.x) {
        type = TYPE_SERVICE;
        id = params.x;
    } else if(params.p) {
        type = TYPE_PARTICIPATION;
        id = params.p;
    } else if(params.a) {
        type = TYPE_AFFILIATION;
        id = ('all' !== params.a) ? params.a : undefined;
    } else {
        type = TYPE_W3C;
        return false;
    }
    return true;
};

/**
 * @TODO
 */

var buildIndex = function() {
    var sections = SECTIONS[type];
    var result = '';
    for(var s in sections) {
        result += '<li><a href="#' + sections[s] + '">' + sections[s] + '</a></li>\n';
    }
    return result;
};

/**
 * @TODO
 */

var buildLink = function(href, type) {
    var REGEX_FUNCTION = /\/functions\/(\d+)$/i,
        REGEX_GROUP = /\/groups\/(\d+)$/i,
        REGEX_CHARTER = /\/groups\/(\d+)\/charters\/(\d+)$/i,
        REGEX_SPEC = /\/specifications\/([^\/]+)$/i,
        REGEX_VERSION = /\/specifications\/(.+)\/versions\/(\d+)$/i,
        REGEX_USER = /\/users\/([a-zA-z\d]+)$/i,
        REGEX_SERVICE = /\/services\/(\d+)$/i,
        REGEX_PARTICIPATIONS = /\/participations\/(\d+)$/i,
        REGEX_AFFILIATIONS = /\/affiliations\/(\d+)$/i;
    var match = REGEX_FUNCTION.exec(href);
    if (match && match.length > 1) return '?f=' + match[1];
    match = REGEX_GROUP.exec(href);
    if (match && match.length > 1) return '?g=' + match[1];
    if ('group' === type) return `?g=${href}`;
    match = REGEX_CHARTER.exec(href);
    if (match && match.length > 2) return '?g=' + match[1] + '&c=' + match[2];
    match = REGEX_SPEC.exec(href);
    if (match && match.length > 1) return '?s=' + match[1];
    if ('spec' === type) return `?s=${href}`;
    match = REGEX_VERSION.exec(href);
    if (match && match.length > 2) return '?s=' + match[1] + '&v=' + match[2];
    match = REGEX_USER.exec(href);
    if (match && match.length > 1) return '?u=' + match[1];
    match = REGEX_SERVICE.exec(href);
    if (match && match.length > 1) return '?x=' + match[1];
    match = REGEX_PARTICIPATIONS.exec(href);
    if (match && match.length > 1) return '?p=' + match[1];
    match = REGEX_AFFILIATIONS.exec(href);
    if (match && match.length > 1) return '?a=' + match[1];
    if ('affiliation' === type) return `?a=${href}`;
    return href;
};

/**
 * @TODO
 */

var getDateFromURL = function(href) {
    var REGEX_DATE = /\/(\d{4})(\d{2})(\d{2})$/,
        match = REGEX_DATE.exec(href);
    if (match && match.length > 3) {
        var date = new Date(match[1], match[2] - 1, match[3]);
        return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    } else
        return undefined;
};

/**
 * @TODO
 */

var showSection = function(section) {
    $(`#${section}`).show();
    $(`li a[href="#${section}"]`).css('display', 'block');
};
