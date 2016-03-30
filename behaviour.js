'use strict';

const API_KEY = 'f093zc7jyxskgscw0kkgk4w4go0w80k',
    REGEX_URI = /^https?:\/\/(www\.)?((.+)[^\ \/])\/?$/i,
    REGEX_DATE = /^[\d\-\/\.\ ]{8,10}$/i,
    MODE = 'param',
    TYPE_W3C = 'w3c',
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
    SECTIONS_USER = ['affiliations', 'groups', 'participations', 'specifications'],
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
    },
    FIELDS_DOMAIN = ['is-closed', 'staging'],
    FIELDS_GROUP = ['type', 'description', 'start-date', 'end-date', 'is-closed', 'staging', 'participation-as-public-ie-allowed', 'is-on-rec-track'],
    FIELDS_CHARTER = ['start', 'initial-end', 'end', 'uri', 'cfp-uri', 'required-new-commitments'],
    FIELDS_SPEC = ['shortname', 'description', 'shortlink'],
    FIELDS_VERSION = ['status', 'uri', 'date', 'informative', 'shortlinke', 'editor-draft', 'process-rules'],
    FIELDS_USER = ['given', 'family', 'work-title'],
    FIELDS_SERVICE = ['type', 'link', 'external', 'closed'],
    FIELDS_PARTICIPATION = ['individual', 'created'],
    FIELDS_AFFILIATION = ['is-member'],
    FIELDS = {
        'domain': FIELDS_DOMAIN,
        'group': FIELDS_GROUP,
        'charter': FIELDS_CHARTER,
        'spec': FIELDS_SPEC,
        'version': FIELDS_VERSION,
        'user': FIELDS_USER,
        'service': FIELDS_SERVICE,
        'participation': FIELDS_PARTICIPATION,
        'affiliation': FIELDS_AFFILIATION,
    },
    DEEPFIELDS_DOMAIN = ['homepage', 'lead'],
    DEEPFIELDS_GROUP = ['domain', 'active-charter', 'homepage', 'join', 'pp-status'],
    DEEPFIELDS_CHARTER = ['group', 'next-charter', 'previous-charter'],
    DEEPFIELDS_SPEC = ['first-version', 'latest-version'],
    DEEPFIELDS_VERSION = ['specification'],
    DEEPFIELDS_USER = ['photos'],
    DEEPFIELDS_SERVICE = [],
    DEEPFIELDS_PARTICIPATION = ['group', 'organization', 'user'],
    DEEPFIELDS_AFFILIATION = ['homepage'],
    DEEPFIELDS = {
        'domain': DEEPFIELDS_DOMAIN,
        'group': DEEPFIELDS_GROUP,
        'charter': DEEPFIELDS_CHARTER,
        'spec': DEEPFIELDS_SPEC,
        'version': DEEPFIELDS_VERSION,
        'user': DEEPFIELDS_USER,
        'service': DEEPFIELDS_SERVICE,
        'participation': DEEPFIELDS_PARTICIPATION,
        'affiliation': DEEPFIELDS_AFFILIATION,
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
        id = ('all' !== params.d) ? params.d : undefined;
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
    return href;
};

/**
 * Set up the page.
 *
 * @param {Function} $ the jQuery object.
 * @param {Object} api an object to access the W3C API.
 */

const init = function($, api) {

    const buildRoot = function() {
        const section = '<ul>\n' +
            '<li><a href="entity.html?d=all">All domains</a></li>\n' +
            '<li><a href="entity.html?g=all">All groups</a></li>\n' +
            '<li><a href="entity.html?s=all">All specifications</a></li>\n' +
            '<li><a href="entity.html?a=all">All affiliations</a></li>\n' +
            '</ul>\n';
        article.append(section);
    };

    const retrieveEntity = function() {

        const renderItem = function(item) {
            if (!item)
                return window.alert('Error: tried to render an undefined item.')
            else if (item.href && item.title)
                return '<li><a href="' + buildLink(item.href) + '">' + item.title + '</a></li>\n';
            else if (item.href)
                return '<li><a href="' + buildLink(item.href) + '">[Item]</a></li>\n';
            else
                return '<li>[Type of item not supported yet]</li>\n';
        };

        const renderField = function(key, value, label) {
            if (undefined === key || undefined === value)
                return window.alert('Error: tried to render an undefined field.')
            else if ('boolean' === typeof value)
                return '<p><strong>' + key + '</strong>: <span class="' +
                    (value ? 'yes">&#10003;' : 'no">&#10007;') +
                    '</span></p>\n';
            else if (REGEX_URI.test(value)) {
                if (label)
                    return '<p><strong>' + key + '</strong>: <a href="' + buildLink(value) + '">' + label + '</a></p>\n';
                else if (value === buildLink(value))
                    return '<p><strong>' + key + '</strong>: <a href="' + value + '"><code>' + normaliseURI(value) + '</code></a></p>\n';
                else
                    return '<p><strong>' + key + '</strong>: <a href="' + buildLink(value) + '">see</a></p>\n';
            } else if (REGEX_DATE.test(value))
                return '<p><strong>' + key + '</strong>: ' + value + '</p>\n';
            else if ('string' === typeof value)
                return '<p><strong>' + key + '</strong>: <em>' + value + '</em></p>\n';
            else
                return '<p><strong>' + key + '</strong>: [Type of field not supported yet]</p>\n';
        };

        const renderPhoto = function(photos) {
            for (var p of photos)
                if ('thumbnail' === p.name)
                    return '<p><img src="' + p.href + '" alt="Portrait of the user" /></p>\n';
        };

        const buildHandler = function(s) {
            return function(error, data) {
                if (error) {
                    // window.alert('Error: "' + error + '"');
                } else {
                    console.dir(data);
                    var section = '<h2 id="' + s + '">' + s + '</h2>\n' +
                        '<ul>\n';
                    for(var i of data)
                        if (undefined !== i)
                            section += renderItem(i);
                    section += '</ul>\n';
                    article.append(section);
                }
            };
        };

        const listEntities = function(list) {
            var section = '<ul>\n';
            for(var i of list)
                section += renderItem(i);
            section += '</ul>\n';
            article.append(section);
        };

        const buildFields = function(data) {
            var fields = FIELDS[type],
                f;
            var section = '<section class="fields">\n';
            for(f of fields)
                if (undefined !== data[f])
                    section += renderField(f, data[f])
            fields = DEEPFIELDS[type];
            for(f of fields) {
                if ('photos' === f)
                    section += renderPhoto(data['_links'].photos)
                else if (undefined !== data['_links'] && undefined !== data['_links'][f])
                    section += renderField(f, data['_links'][f].href, data['_links'][f].title)
            }
            section += '<section>\n';
            article.append(section);
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
                var name = '[Item]';
                if (undefined === id) {
                    name = 'All ';
                    if (TYPE_DOMAIN === type)
                        name += 'domains';
                    if (TYPE_GROUP === type)
                        name += 'groups';
                    if (TYPE_SPEC === type)
                        name += 'specifications';
                    if (TYPE_AFFILIATION === type)
                        name += 'affiliations';
                    listEntities(data);
                } else {
                    if (data.name) name = data.name;
                    else if (data.title) name = data.title;
                    else if (data.link) name = '<code>' + normaliseURI(data.link) + '</code>';
                    else if (data.uri) name = '<code>' + normaliseURI(data.uri) + '</code>';
                    else if (data.created) name = data.created;
                    index.html(buildIndex());
                    fetchSections();
                    buildFields(data);
                }
                title.html(title.html() + ' &mdash; ' + name);
                h1.html('<a href="#">' + name + '</a>');
            }
        };

        if (TYPE_DOMAIN === type) {
            if (id)
                api.domain(id).fetch(processEntity);
            else
                api.domains().fetch(processEntity);
        } else if (TYPE_GROUP === type) {
            if (id)
                api.group(id).fetch(processEntity);
            else
                api.groups().fetch(processEntity);
        } else if (TYPE_CHARTER === type) {
            api.group(id.g).charter(id.c).fetch(processEntity);
        } else if (TYPE_SPEC === type) {
            if (id)
                api.specification(id).fetch(processEntity);
            else
                api.specifications().fetch(processEntity);
        } else if (TYPE_VERSION === type) {
            api.specification(id.s).version(id.v).fetch(processEntity);
        } else if (TYPE_USER === type) {
            api.user(id).fetch(processEntity);
        } else if (TYPE_SERVICE === type) {
            api.service(id).fetch(processEntity);
        } else if (TYPE_PARTICIPATION === type) {
            api.participation(id).fetch(processEntity);
        } else if (TYPE_AFFILIATION === type) {
            if (id)
                api.affiliation(id).fetch(processEntity);
            else
                api.affiliations().fetch(processEntity);
        }
    };

    $(document).ready(function() {
        title = $('head title');
        head = $('header');
        h1 = $('header h1');
        nav = $('nav');
        index = $('#index');
        article = $('article');
        if (processURL()) {
            api.apiKey = API_KEY;
            api.authMode = MODE;
            retrieveEntity();
            setTimeout(function() {
                $('html').removeClass('no-js').addClass('js');
            }, 1000);
        } else {
            buildRoot();
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
