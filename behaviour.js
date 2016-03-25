'use strict';

const API_KEY = 'f093zc7jyxskgscw0kkgk4w4go0w80k',
    MODE = 'param',
    TYPE_DOMAIN = 'domain',
    TYPE_GROUP = 'group',
    TYPE_CHARTER = 'charter',
    TYPE_SPEC = 'spec',
    TYPE_VERSION = 'version',
    TYPE_USER = 'user',
    TYPE_SERVICE = 'service',
    TYPE_PARTICIPATION = 'participation',
    TYPE_AFFILIATION = 'affiliation',
    SECTIONS_DOMAIN = ['groups', 'services', 'users'],
    SECTIONS_GROUP = ['chairs', 'services', 'specifications', 'teamcontacts', 'users', 'charters', 'participations'],
    SECTIONS_CHARTER = [],
    SECTIONS_SPEC = [/* 'superseded', 'supersedes', */ 'versions' /*, 'latest' */],
    SECTIONS_VERSION = ['deliverers', 'editors', 'successors', 'predecessors'],
    SECTIONS_USER = ['affiliations', 'groups', /* 'participations', */ 'specifications'],
    SECTIONS_SERVICE = ['groups'],
    SECTIONS_PARTICIPATION = ['participants'],
    SECTIONS_AFFILIATION = ['participants', 'participations'],
    SECTIONS = {
        'domain': SECTIONS_DOMAIN,
        'group': SECTIONS_GROUP,
        'charter': SECTIONS_CHARTER,
        'spec': SECTIONS_SPEC,
        'version': SECTIONS_VERSION,
        'user': SECTIONS_USER,
        'service': SECTIONS_SERVICE,
        'participation': SECTIONS_PARTICIPATION,
        'affiliation': SECTIONS_AFFILIATION,
    };

var type,
    id,
    title,
    head,
    h1,
    nav,
    index,
    article;

/**
 * Reduce a URI to its minimum expression, for easier comparison.
 *
 * This works heuristically; it strips a URI of the usual variants and converts it to lowercase.
 * Some chunks that are removed are: protocol, "www." at the beginning, "/" at the end.
 *
 * @param {String} uri - Original URI.
 * @returns {String} The "normalised", (probably) equivalent URI.
 */

const normaliseURI = function(uri) {

    const REGEX_URI = /https?:\/\/(www\.)?((.+)[^\ \/])\/?$/i;
    var result = uri.trim().toLowerCase();
    const matches = REGEX_URI.exec(result);

    if (matches && matches.length > 2) {
        result = matches[2];
    }

    return result;

};

const getUrlVars = function() {
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

const processURL = function() {
    const params = getUrlVars();
    if(params.d) {
        type = TYPE_DOMAIN;
        id = params.d;
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
        id = params.g;
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
        id = params.s;
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
        id = params.a;
    } else {
        window.alert('Error: missing parameters in URL.')
        return false;
    }
    console.log('type: ' + type + '; id: ' + id);
    return true;
};

const buildIndex = function() {
    const sections = SECTIONS[type];
    var result = '';
    for(var s in sections) {
        result += '<li><a href="#' + sections[s] + '">' + sections[s] + '</a></li>\n';
    }
    return result;
};

const buildLink = function(href) {
    const REGEX_DOMAIN = /\/domains\/(\d+)$/i,
        REGEX_GROUP = /\/groups\/(\d+)$/i,
        REGEX_CHARTER = /\/groups\/(\d+)\/charters\/(\d+)$/i,
        REGEX_SPEC = /\/specifications\/([^\/]+)$/i,
        REGEX_VERSION = /\/specifications\/(.+)\/versions\/(\d+)$/i,
        REGEX_USER = /\/users\/([a-zA-z\d]+)$/i,
        REGEX_SERVICE = /\/services\/(\d+)$/i,
        REGEX_PARTICIPATIONS = /\/participations\/(\d+)$/i,
        REGEX_AFFILIATIONS = /\/affiliations\/(\d+)$/i;
    var match = REGEX_DOMAIN.exec(href);
    if (match && match.length > 1) return 'entity.html?d=' + match[1];
    match = REGEX_GROUP.exec(href);
    if (match && match.length > 1) return 'entity.html?g=' + match[1];
    match = REGEX_CHARTER.exec(href);
    if (match && match.length > 2) return 'entity.html?g=' + match[1] + '&c=' + match[2];
    match = REGEX_SPEC.exec(href);
    if (match && match.length > 1) return 'entity.html?s=' + match[1];
    match = REGEX_VERSION.exec(href);
    if (match && match.length > 2) return 'entity.html?s=' + match[1] + '&v=' + match[2];
    match = REGEX_USER.exec(href);
    if (match && match.length > 1) return 'entity.html?u=' + match[1];
    match = REGEX_SERVICE.exec(href);
    if (match && match.length > 1) return 'entity.html?x=' + match[1];
    match = REGEX_PARTICIPATIONS.exec(href);
    if (match && match.length > 1) return 'entity.html?p=' + match[1];
    match = REGEX_AFFILIATIONS.exec(href);
    if (match && match.length > 1) return 'entity.html?a=' + match[1];
};

/**
 * Set up the page.
 *
 * @param {Function} $ the jQuery object.
 * @param {Object} api an object to access the W3C API.
 */

const init = function($, api) {

    const retrieveEntity = function() {

        const buildHandler = function(s) {
            return function(error, data) {
                if (error) {
                    window.alert('Error: "' + error + '""');
                } else {
                    console.dir(data);
                    var section = '<h2 id="' + s + '">' + s + '</h2>\n' +
                        '<ul>\n';
                    for(var i in data) {
                        if (data[i]) {
                            if (data[i].href && data[i].title) {
                                section += '<li><a href="' + buildLink(data[i].href) + '">' + data[i].title + '</a></li>\n';
                            } else if (data[i].href) {
                                section += '<li><a href="' + buildLink(data[i].href) + '">[Item]</a></li>\n';
                            } else {
                                section += '<li>[Type of item not supported yet]</li>\n';
                            }
                        } else {
                            section += '<li>[Type of item not supported yet]</li>\n';
                        }
                    }
                    section += '</ul>\n';
                    article.append(section);
                }
            };
        };

        const fetchSections = function() {
            const sections = SECTIONS[type];
            var func, thisSec;
            if (TYPE_VERSION === type) {
                for(var s in sections) {
                    thisSec = sections[s];
                    api.specification(id.s).version(id.v)[thisSec]().fetch(buildHandler(thisSec));
                }
            } else {
                if (TYPE_DOMAIN === type) {
                    func = api.domain;
                } else if (TYPE_GROUP === type) {
                    func = api.group;
                } else if (TYPE_CHARTER === type) {
                    func = api.charter;
                } else if (TYPE_SPEC === type) {
                    func = api.specification;
                } else if (TYPE_USER === type) {
                    func = api.user;
                } else if (TYPE_SERVICE === type) {
                    func = api.service;
                } else if (TYPE_PARTICIPATION === type) {
                    func = api.participation;
                } else if (TYPE_AFFILIATION === type) {
                    func = api.affiliation;
                }
                for(var s in sections) {
                    thisSec = sections[s];
                    func(id)[thisSec]().fetch(buildHandler(thisSec));
                }
            }
        };

        const processEntity = function(error, data) {
            if (error) {
                window.alert('Error: "' + error + '""');
            } else {
                console.dir();
                var name = '[Item]';
                if (data.name) name = data.name;
                else if (data.title) name = data.title;
                else if (data.link) name = '<code>' + normaliseURI(data.link) + '</code>';
                else if (data.uri) name = '<code>' + normaliseURI(data.uri) + '</code>';
                else if (data.created) name = data.created;
                title.html(title.html() + ' &mdash; ' + name);
                h1.html('<a href="#">' + name + '</a>');
                index.html(buildIndex());
                fetchSections();
            }
        };

        if (TYPE_DOMAIN === type) {
            api.domain(id).fetch(processEntity);
        } else if (TYPE_GROUP === type) {
            api.group(id).fetch(processEntity);
        } else if (TYPE_CHARTER === type) {
            api.group(id.g).charter(id.c).fetch(processEntity);
        } else if (TYPE_SPEC === type) {
            api.specification(id).fetch(processEntity);
        } else if (TYPE_VERSION === type) {
            api.specification(id.s).version(id.v).fetch(processEntity);
        } else if (TYPE_USER === type) {
            api.user(id).fetch(processEntity);
        } else if (TYPE_SERVICE === type) {
            api.service(id).fetch(processEntity);
        } else if (TYPE_PARTICIPATION === type) {
            api.participation(id).fetch(processEntity);
        } else if (TYPE_AFFILIATION === type) {
            api.affiliation(id).fetch(processEntity);
        }
    };

    $(document).ready(function() {
        if (processURL()) {
            api.apiKey = API_KEY;
            api.authMode = MODE;
            title = $('head title');
            head = $('header');
            h1 = $('header h1');
            nav = $('nav');
            index = $('#index');
            article = $('article');
            retrieveEntity();
            setTimeout(function() {
                $('html').removeClass('no-js').addClass('js');
            }, 1000);
        }
    });

};

// Set up RequireJS:
requirejs.config({
    paths: {
        jquery: 'https://www.w3.org/scripts/jquery/2.1/jquery.min',
        w3capi: 'w3capi'
    }
});

// Load dependencies asynchronously via RequireJS:
requirejs(['jquery', 'w3capi'], init);
