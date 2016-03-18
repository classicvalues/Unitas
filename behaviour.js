'use strict';

const API_KEY = 'c5oe47cc7l4oookck8co4o4owg4w4o8',
    MODE = 'param',
    TYPE_DOMAIN = 'domain',
    TYPE_GROUP = 'group',
    TYPE_SPEC = 'spec',
    TYPE_USER = 'user',
    TYPE_SERVICE = 'service',
    SECTIONS_DOMAIN = ['groups', 'services', 'users'],
    SECTIONS_GROUP = ['chairs', 'services', 'specifications', 'teamcontacts', 'users', 'charters', 'participations'],
    SECTIONS_SPEC = [/* 'superseded', 'supersedes', */ 'versions' /*, 'latest' */],
    SECTIONS_USER = ['affiliations', 'groups', /* 'participations', */ 'specifications'],
    SECTIONS_SERVICE = ['groups'],
    SECTIONS = {'domain': SECTIONS_DOMAIN, 'group': SECTIONS_GROUP, 'spec': SECTIONS_SPEC, 'user': SECTIONS_USER, 'service': SECTIONS_SERVICE};

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
    } else if(params.g) {
        type = TYPE_GROUP;
        id = params.g;
    } else if(params.s) {
        type = TYPE_SPEC;
        id = params.s;
    } else if(params.u) {
        type = TYPE_USER;
        id = params.u;
    } else if(params.x) {
        type = TYPE_SERVICE;
        id = params.x;
    } else {
        window.alert('Error: missing parameters in URL.')
        return false;
    }
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
                            /* if (data[i].href && data[i].title) {
                                section += '<li><a href="' + data[i].href + '">' + data[i].title + '</a></li>\n';
                            } else */ if (data[i].title) {
                                section += '<li>' + data[i].title + '</li>\n';
                            } else if (data[i].name) {
                                section += '<li>' + data[i].name + '</li>\n';
                            } else if (data[i].href) {
                                section += '<li><code>' + normaliseURI(data[i].href) + '</code></li>\n';
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
            if (TYPE_DOMAIN === type) {
                func = api.domain;
            } else if (TYPE_GROUP === type) {
                func = api.group;
            } else if (TYPE_SPEC === type) {
                func = api.specification;
            } else if (TYPE_USER === type) {
                func = api.user;
            } else if (TYPE_SERVICE === type) {
                func = api.service;
            }
            for(var s in sections) {
                thisSec = sections[s];
                func(id)[thisSec]().fetch(buildHandler(thisSec));
            }
        };

        const processEntity = function(error, data) {
            if (error) {
                window.alert('Error: "' + error + '""');
            } else {
                console.dir(data);
                var name = '[Item]';
                if (data.name) name = data.name;
                else if (data.title) name = data.title;
                else if (data.link) name = '<code>' + normaliseURI(data.link) + '</code>';
                title.html(title.html() + ' &mdash; ' + name);
                h1.html('<a href="#">' + name + '</a>'); // + ' (' + data.type + ')');
                index.html(buildIndex());
                fetchSections();
            }
        };

        if (TYPE_DOMAIN === type) {
            api.domain(id).fetch(processEntity);
        } else if (TYPE_GROUP === type) {
            api.group(id).fetch(processEntity);
        } else if (TYPE_SPEC === type) {
            api.specification(id).fetch(processEntity);
        } else if (TYPE_USER === type) {
            api.user(id).fetch(processEntity);
        } else if (TYPE_SERVICE === type) {
            api.service(id).fetch(processEntity);
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
        w3capi: 'https://raw.githubusercontent.com/w3c/node-w3capi/master/lib/w3capi'
    }
});

// Load dependencies asynchronously via RequireJS:
requirejs(['jquery', 'w3capi'], init);
