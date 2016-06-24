'use strict';

const API_KEY = 'f093zc7jyxskgscw0kkgk4w4go0w80k',
    DEBUG = false,
    OPTS = {},    // {embed: true},
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
    html,
    body,
    title,
    bar,
    innerBar,
    percent,
    nav,
    index,
    article,
    total = 0,
    pending = 0;

/**
 * Set up the page.
 *
 * @param {Object} api an object to access the W3C API.
 */

const init = function(api) {

    $('html').removeClass('no-js').addClass('js');

    /**
     * Respond to vertical scrolling
     */

    const handleScroll = function(event) {
        html.toggleClass('scrolled', body[0].scrollTop > 0);
        if (body[0].scrollTop > 74)
            title.fadeIn();
        else
            title.fadeOut();
    };

    /**
     * Switch between toggle and narrow modes.
     */

    const toggleWidth = function(event) {
        $('.container, .container-fluid')
            .toggleClass('container-fluid', event.target.checked)
            .toggleClass('container', !event.target.checked);
    };

    /**
     * @TODO
     */

    const buildRoot = function() {
        const section = '<ul>\n' +
            '<li><a href="?d=all">All domains</a></li>\n' +
            '<li><a href="?g=all">All groups</a></li>\n' +
            '<li><a href="?s=all">All specifications</a></li>\n' +
            '<li><a href="?a=all">All affiliations</a></li>\n' +
            '</ul>\n';
        article.append(section);
    };

    /**
     * @TODO
     */

    const updateProgress = function(delta) {
        pending += delta;
        if (delta > 0)
            total += delta;
        const value = (total - pending) * 100 / total;
        innerBar.css('width', value + '%');
        percent.text(parseInt(value) + '%');
        if (pending < 1) {
            attachHandlers();
            window.setTimeout(function() {
                body.addClass('loaded');
            }, 500);
        }
    };

    /**
     * @TODO
     */

    const retrieveEntity = function() {

        /**
         * @TODO
         */

        const renderItem = function(item) {
            if (!item)
                return window.alert('Error: tried to render an undefined item.')
            else if (item.href && item.title) {
                const date = getDateFromURL(item.href),
                    label = date ? `${date}: ${item.title}` : item.title;
                return '<li class="list-group-item"><a href="' + buildLink(item.href) +
                    '" title="' + label + '">' + label + '</a></li>\n';
            } else if (item.href) {
                const REGEX_NO = /\/(\d+)$/,
                    no = REGEX_NO.exec(item.href),
                    label = no ? `#${no[1]}` : '[Item]';
                return '<li class="list-group-item"><a href="' + buildLink(item.href) + '">' + label + '</a></li>\n';
            } else
                return '<li class="list-group-item">[Type of item not supported yet]</li>\n';
        };

        /**
         * @TODO
         */

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

        /**
         * @TODO
         */

        const renderPhoto = function(photos) {
            if (photos) {
                for (var p of photos)
                    if ('thumbnail' === p.name)
                        return '<p class="pull-right"><img src="' + p.href + '" alt="Portrait of the user"></p>\n';
            } else {
                // return window.alert('Error: this user has no photos.')
            }
        };

        /**
         * @TODO
         */

        const buildAPIHandler = function(s) {
            return function(error, data) {
                if (error) {
                    // window.alert('Error: "' + error + '"');
                } else {
                    if (DEBUG) console.dir(data);
                    var widget = $('#sample-widget').clone(),
                        item;
                    widget.attr('id', s).removeClass('sample');
                    $('h3', widget).contents()[0].textContent = s + ' ';
                    $('h3 span.count', widget).text(data.length);
                    $('h3 a', widget).attr('href', '#' + s);
                    for(var i of data)
                        if (undefined !== i) {
                            item = $(renderItem(i));
                            $('.list-group', widget).append(item);
                        }
                    $('#details').append(widget);
                }
                updateProgress(-1);
            };
        };

        /**
         * @TODO
         */

        const listEntities = function(list) {
            const aboutSection = $('#about .panel-body');
            for(var i of list)
                aboutSection.append(renderItem(i));
        };

        /**
         * @TODO
         */

        const buildFields = function(data) {
            const aboutSection = $('#about .panel-body');
            var fields = FIELDS[type],
                f;
            for(f of fields)
                if (undefined !== data[f])
                    aboutSection.append(renderField(f, data[f]));
            fields = DEEPFIELDS[type];
            for(f of fields) {
                if ('photos' === f) {
                    const photoSection = renderPhoto(data['_links'].photos);
                    if (photoSection)
                        aboutSection.append(photoSection);
                } else if (undefined !== data['_links'] && undefined !== data['_links'][f])
                    aboutSection.append(renderField(f, data['_links'][f].href, data['_links'][f].title));
            }
        };

        /**
         * @TODO
         */

        const fetchSections = function() {
            const sections = SECTIONS[type];
            var func, thisSec;
            if (TYPE_VERSION === type) {
                for(var s in sections) {
                    thisSec = sections[s];
                    updateProgress(1);
                    api.specification(id.s).version(id.v)[thisSec]().fetch(OPTS, buildAPIHandler(thisSec));
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
                    updateProgress(1);
                    func(id)[thisSec]().fetch(OPTS, buildAPIHandler(thisSec));
                }
            }
        };

        /**
         * @TODO
         */

        const processEntity = function(error, data) {
            if (error) {
                window.alert('Error: "' + error + '""');
            } else {
                if (DEBUG) console.dir(data);
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
                    name = abbreviateGroupName(name);
                    index.html(buildIndex());
                    fetchSections();
                    buildFields(data);
                }
                const headTitle = $('head title');
                headTitle.html(headTitle.text() + ' &middot; ' + $('<span>' + name + '</span>').text());
                title.removeClass('loading').filter('a').html(name);
                $('h1').removeClass('loading')
                $('h1 a').html(name);
            }
            updateProgress(-1);
        };

        if (TYPE_DOMAIN === type) {
            updateProgress(1);
            if (id)
                api.domain(id).fetch(OPTS, processEntity);
            else
                api.domains().fetch(OPTS, processEntity);
        } else if (TYPE_GROUP === type) {
            updateProgress(1);
            if (id)
                api.group(id).fetch(OPTS, processEntity);
            else
                api.groups().fetch(OPTS, processEntity);
        } else if (TYPE_CHARTER === type) {
            updateProgress(1);
            api.group(id.g).charter(id.c).fetch(OPTS, processEntity);
        } else if (TYPE_SPEC === type) {
            updateProgress(1);
            if (id)
                api.specification(id).fetch(OPTS, processEntity);
            else
                api.specifications().fetch(OPTS, processEntity);
        } else if (TYPE_VERSION === type) {
            updateProgress(1);
            api.specification(id.s).version(id.v).fetch(OPTS, processEntity);
        } else if (TYPE_USER === type) {
            updateProgress(1);
            api.user(id).fetch(OPTS, processEntity);
        } else if (TYPE_SERVICE === type) {
            updateProgress(1);
            api.service(id).fetch(OPTS, processEntity);
        } else if (TYPE_PARTICIPATION === type) {
            updateProgress(1);
            api.participation(id).fetch(OPTS, processEntity);
        } else if (TYPE_AFFILIATION === type) {
            updateProgress(1);
            if (id)
                api.affiliation(id).fetch(OPTS, processEntity);
            else
                api.affiliations().fetch(OPTS, processEntity);
        }
    };

    /**
     * @TODO
     */

    const collapseNavBar = function() {
        $('.navbar-collapse').collapse('hide');
    };

    /**
     * @TODO
     */

    const showNotImplemented = function() {
        if (event && event.target &&
            'permalink' !== event.target.className && 'span' !== event.target.tagName.toLowerCase() &&
            (!event.which || 1 === event.which)) {
            $('#not-implemented').modal('show');
        }
    };

    /**
     * @TODO
     */

    const attachHandlers = function() {
        $('#optionWide').change(buildHandler(toggleWidth));
        $(document).scroll(handleScroll);
        $('.navbar-nav').click(collapseNavBar);
        $('.panel-heading').mousedown(showNotImplemented);
    };

    /**
     * @TODO
     */

    $(document).ready(function() {
        html = $('html');
        body = $('body');
        title = $('#title');
        bar = $('#progress-container');
        innerBar = $('#progress-bar');
        percent = $('#progress-value');
        nav = $('nav');
        index = $('#index');
        article = $('article');
        if (processURL()) {
            if (TYPE_GROUP === type && undefined !== id) {
                $('#dashboard').show();
                $('li a[href="#dashboard"]').css('display', 'block');
            }
            api.apiKey = API_KEY;
            api.authMode = MODE;
            retrieveEntity();
        } else {
            buildRoot();
        }
    });

};

// Set up RequireJS:
requirejs.config({
    paths: {
        w3capi: 'https://w3c.github.io/node-w3capi/lib/w3capi',
        // @TODO: switch to minified jQuery in production:
        // jquery: 'https://code.jquery.com/jquery-2.2.3.min',
        jquery: 'https://code.jquery.com/jquery-2.2.3',
        // @TODO: switch to minified Bootstrap JS in production:
        // bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap',
        utils: 'utils'
    },
    shim: {
        'bootstrap': ['jquery']
    }
});

// Load dependencies asynchronously via RequireJS:
requirejs(['w3capi', 'jquery', 'bootstrap', 'utils'], init);
