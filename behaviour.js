'use strict';

var VERSION = '2.4.1',
    API_KEY = 'f093zc7jyxskgscw0kkgk4w4go0w80k',
    DEBUG = false,
    OPTS = {embed: true},
    REGEX_URI = /^(https?|irc):\/\/(www\.)?((.+)[^\ \/])\/?$/i,
    TWITTER_URI = /^https?:\/\/(www\.)?twitter.com\/([^\ \/]+)\/?$/i,
    REGEX_DATE = /^[\d\-\/\.\ ]{8,10}$/i,
    MODE = 'param',
    TYPE_W3C = 'w3c',
    TYPE_FUNCTION = 'function',
    TYPE_GROUP = 'group',
    TYPE_CHARTER = 'charter',
    TYPE_SPEC = 'spec',
    TYPE_VERSION = 'version',
    TYPE_USER = 'user',
    TYPE_SERVICE = 'service',
    TYPE_PARTICIPATION = 'participation',
    TYPE_AFFILIATION = 'affiliation',
    SECTIONS_FUNCTION = ['services', 'users'],
    SECTIONS_GROUP = ['chairs', 'services', 'specifications', 'teamcontacts', 'users', 'charters', 'participations'],
    SECTIONS_CHARTER = [],
    SECTIONS_SPEC = ['versions'],
    SECTIONS_VERSION = ['deliverers', 'editors', 'successors', 'predecessors'],
    SECTIONS_USER = ['affiliations', 'groups', 'participations', 'specifications'],
    SECTIONS_SERVICE = ['groups'],
    SECTIONS_PARTICIPATION = ['participants'],
    SECTIONS_AFFILIATION = ['participants', 'participations'],
    SECTIONS = {
        'function': SECTIONS_FUNCTION,
        'group': SECTIONS_GROUP,
        'charter': SECTIONS_CHARTER,
        'spec': SECTIONS_SPEC,
        'version': SECTIONS_VERSION,
        'user': SECTIONS_USER,
        'service': SECTIONS_SERVICE,
        'participation': SECTIONS_PARTICIPATION,
        'affiliation': SECTIONS_AFFILIATION,
    },
    NICE_LABELS = {
        'active-charter': 'Active charter',
        'affiliations': 'Affiliations',
        'cfp-uri': '<abbr title="Uniform Resource Identifier">URI</abbr> for the <abbr title="Call For Participation">CFP</abbr>',
        'chairs': 'Chairs',
        'charters': 'Charters',
        'closed': 'Closed',
        'created': 'Created',
        'date': 'Date',
        'deliverers': 'Deliverers',
        'description': 'Description',
        'function': 'Function',
        'editor-draft': `Editor's draft`,
        'editors': 'Editors',
        'end-date': 'Ends',
        'end': 'End',
        'external': 'External',
        'family': 'Family name',
        'first-version': 'First version',
        'given': 'Given name',
        'group': 'Group',
        'groups': 'Groups',
        'homepage': 'Home page',
        'individual': 'Individual',
        'informative': 'Is informative',
        'initial-end': 'Initially ended',
        'is-closed': 'Is closed',
        'is-member': 'Is member',
        'is-on-rec-track': 'Is on <em>Rec track</em>',
        'join': '<abbr title="Uniform Resource Identifier">URI</abbr> to join',
        'latest-version': 'Latest version',
        'lead': 'Lead',
        'link': 'Link',
        'next-charter': 'Next charter',
        'organization': 'Organization',
        'participants': 'Participants',
        'participation-as-public-ie-allowed': 'Is participation as public <abbr title="Invited Expert">IE</abbr> allowed',
        'participations': {
            'group': 'Members',
            'user': 'Participations',
            'affiliation': 'Groups'
        },
        'photos': 'Photos',
        'pp-status': '<abbr title="Patent Policy">PP</abbr> status',
        'predecessors': 'Predecessors',
        'previous-charter': 'Previous charter',
        'process-rules': 'Process rules',
        'required-new-commitments': 'Required new commitments',
        'services': 'Services',
        'shortlink': '<em>Shortlink</em>',
        'shortname': '<em>Shortname</em>',
        'specification': 'Specification',
        'specifications': 'Specifications',
        'staging': 'Staging',
        'start-date': 'Starts',
        'start': 'Start',
        'status': 'Status',
        'successors': 'Successors',
        'teamcontacts': 'Team contacts',
        'type': 'Type',
        'uri': '<abbr title="Uniform Resource Identifier">URI</abbr>',
        'user': 'Participant',
        'users': 'Participants',
        'versions': 'Versions',
        'work-title': 'Work title'
    },
    FIELDS_FUNCTION = ['is-closed', 'staging'],
    FIELDS_GROUP = ['type', 'description', 'start-date', 'end-date', 'is-closed', 'staging', 'participation-as-public-ie-allowed', 'is-on-rec-track'],
    FIELDS_CHARTER = ['start', 'initial-end', 'end', 'uri', 'cfp-uri', 'required-new-commitments'],
    FIELDS_SPEC = ['shortname', 'description', 'shortlink'],
    FIELDS_VERSION = ['status', 'uri', 'date', 'informative', 'shortlink', 'editor-draft', 'process-rules'],
    FIELDS_USER = ['given', 'family', 'work-title'],
    FIELDS_SERVICE = ['type', 'link', 'external', 'closed'],
    FIELDS_PARTICIPATION = ['individual', 'created'],
    FIELDS_AFFILIATION = ['is-member'],
    FIELDS = {
        'function': FIELDS_FUNCTION,
        'group': FIELDS_GROUP,
        'charter': FIELDS_CHARTER,
        'spec': FIELDS_SPEC,
        'version': FIELDS_VERSION,
        'user': FIELDS_USER,
        'service': FIELDS_SERVICE,
        'participation': FIELDS_PARTICIPATION,
        'affiliation': FIELDS_AFFILIATION,
    },
    DEEPFIELDS_FUNCTION = ['homepage', 'lead'],
    DEEPFIELDS_GROUP = ['active-charter', 'homepage', 'join', 'pp-status'],
    DEEPFIELDS_CHARTER = ['group', 'next-charter', 'previous-charter'],
    DEEPFIELDS_SPEC = ['first-version', 'latest-version'],
    DEEPFIELDS_VERSION = ['specification'],
    DEEPFIELDS_USER = ['photos'],
    DEEPFIELDS_SERVICE = [],
    DEEPFIELDS_PARTICIPATION = ['group', 'organization', 'user'],
    DEEPFIELDS_AFFILIATION = ['homepage'],
    DEEPFIELDS = {
        'function': DEEPFIELDS_FUNCTION,
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
    total = 0,
    pending = 0;

/**
 * Set up the page.
 *
 * @param {Object} api an object to access the W3C API.
 */

var init = function(api) {

    $('html').removeClass('no-js').addClass('js');
    console.log(`Unitas version ${VERSION}`);

    /**
     * Respond to vertical scrolling
     */

    var handleScroll = function(event) {
        html.toggleClass('scrolled', body[0].scrollTop > 0);
        if (body[0].scrollTop > 74)
            title.fadeIn();
        else
            title.fadeOut();
    };

    /**
     * Switch between toggle and narrow modes.
     */

    var toggleWidth = function(event) {
        $('.container, .container-fluid')
            .toggleClass('container-fluid', event.target.checked)
            .toggleClass('container', !event.target.checked);
    };

    /**
     * @TODO
     */

    var buildRoot = function() {
        name = 'W3C';
        var headTitle = $('head title');
        headTitle.html(headTitle.text() + ' &middot; ' + $('<span>' + name + '</span>').text());
        title.removeClass('loading').filter('a').html(name);
        $('h1').removeClass('loading')
        $('h1 a').html(name);
        $('#about .panel-body').remove();
        $('#about .list-group').html(`<li class="list-group-item"><a href="?f=all">All functions</a></li>
            <li class="list-group-item"><a href="?g=all">All groups</a></li>
            <li class="list-group-item"><a href="?s=all">All specifications</a></li>
            <li class="list-group-item"><a href="?a=all">All affiliations</a></li>`);
        showSection('about');
        updateProgress(0);
    };

    /**
     * @TODO
     */

    var updateProgress = function(delta) {
        pending += delta;
        if (delta > 0)
            total += delta;
        var value = (total - pending) * 100 / total;
        innerBar.css('width', value + '%');
        percent.text(parseInt(value) + '%');
        if (pending < 1) {
            attachHandlers();
            window.setTimeout(function() {
                body.addClass('loaded');
                body.scrollspy('refresh');
            }, 500);
        }
    };

    /**
     * @TODO
     */

    var retrieveEntity = function() {

        /**
         * @TODO
         */

        var escapeHTML = function(string = '') {
            var tags = /<[^>]*>/g,
                ampersands = /&/g,
                dquotes = /'/g,
                squotes = /"/g;
            return string.replace(tags, '').replace(ampersands, '&amp;').replace(dquotes, '&quot;').replace(squotes, '&#39;');
        };

        /*
         * Function: discr="function", name, staging, is-closed, _links.{lead.title, homepage.href?}.
         * User: discr="user", family, given, id, name, work-title?, _links.self.href.
         * Participation: created, individual, _links.(group.(href, title), self.href, user.(href, title)?, organization.(href, title)?).
         * Group: discr="w3cgroup", description, id, name, type.
         * Affiliation: discr="affiliation"|"organization", id, name.
         * Spec: shortname, title, description?.
         * Version: {_embedded.versions}[date, status, _links.self.href].
         * Service: link, type, shortdesc?.
         * Charter: start, end, initial-end.
         *
         * f=all: functions.
         * g=all: groups.
         * s=all: specs.
         * a=all: affiliations.
         * f=109: users, services.
         * g=68239: users x 3, services, specs, charters, participations.
         * g=46300&c=155: (none).
         * s=dwbp: versions.
         * s=2dcontext&v=20110525: groups, users, versions x 2.
         * u=ggdj8tciu9kwwc4o4ww888ggkwok0c8: participations, groups, specs, affiliations.
         * x=2279: groups.
         * p=1503: users.
         * a=52794: users, groups.
         */

        /**
         * @TODO
         */

        var renderItem = function(entity, type) {
            if (!entity)
                return window.alert('Error: tried to render an undefined item')
            var result;
            if ('function' === entity.discr) {
                // Function:
                result = `<li class="list-group-item">
                    <a href="${buildLink(entity._links.self.href)}">
                        ${entity.name}<span class="suffix">, led by ${entity._links.lead.title}</span>
                    </a>
                </li>`;
            } else if ('user' === entity.discr) {
                // User:
                var prefix = entity['work-title'] ? `<span class="suffix">, ${entity['work-title']}` : '';
                result = `<li class="list-group-item">\
                    <a href="${buildLink(entity._links.self.href)}">\
                        ${entity.name}${prefix}\
                    </a>\
                </li>`;
            } else if (entity.hasOwnProperty('created') && entity.hasOwnProperty('individual')) {
                // Participation:
                var label;
                if (TYPE_GROUP === type) {
                    // We're interested in organisations and users:
                    if (entity.individual)
                        // Person:
                        label = `${entity._links.user.title} <span class="suffix">(individual)</span>`;
                    else
                        // Organisation:
                        label = `${entity._links.organization.title} <span class="suffix">(organization)</span>`;
                } else
                    // TYPE_USER === type || TYPE_AFFILIATION === type; we're interested in groups:
                    label = entity._links.group.title;
                result = `<li class="list-group-item">\
                    <a href="${buildLink(entity._links.self.href)}">\
                        ${label}\
                    </a>\
                </li>`;
            } else if ('w3cgroup' === entity.discr) {
                // Group:
                var descr = entity.description ? ` title="${escapeHTML(entity.description)}"` : '',
                    type = '';
                result = `<li class="list-group-item">\
                    <a${descr} href="${buildLink(entity.id, 'group')}">\
                        ${entity.name}${type}\
                    </a>\
                </li>`;
            } else if (entity.hasOwnProperty('discr') && ('affiliation' === entity.discr || 'organization' === entity.discr)) {
                // Affiliation:
                result = `<li class="list-group-item">\
                    <a href="${buildLink(entity.id, 'affiliation')}">\
                        ${entity.name}\
                    </a>\
                </li>`;
            } else if (entity.hasOwnProperty('shortname') && entity.hasOwnProperty('title')) {
                // Spec:
                var descr = entity.description ? ` title="${escapeHTML(entity.description)}"` : '';
                result = `<li class="list-group-item">\
                    <a${descr} href="${buildLink(entity.shortname, 'spec')}">\
                        ${entity.title} <span class="suffix">(<code>${entity.shortname}</code>)</suffix>\
                    </a>\
                </li>`;
            } else if (entity.hasOwnProperty('date') && entity.hasOwnProperty('status')) {
                // Version:
                result = `<li class="list-group-item">\
                    <a href="${buildLink(entity._links.self.href)}">\
                        ${entity.date} <span class="suffix">(${entity.status})</suffix>\
                    </a>\
                </li>`;
            } else if (entity.hasOwnProperty('link') && entity.hasOwnProperty('type')) {
                // Service:
                if ('lists' === entity.type && entity.hasOwnProperty('shortdesc')) {
                    // Mailing list:
                    result = `<li class="list-group-item">
                        <a href="${buildLink(entity._links.self.href)}">
                            <code>${entity.shortdesc}</code>
                            <span class="suffix">(mailing list)</span>
                        </a>
                    </li>`;
                } else if ('blog' === entity.type && entity.hasOwnProperty('shortdesc')) {
                    // Blog:
                    result = `<li class="list-group-item">
                        <a href="${buildLink(entity._links.self.href)}">
                            ${entity.shortdesc}
                            <span class="suffix">(blog)</span>
                        </a>
                    </li>`;
                } else if ('tracker' === entity.type ||
                    'repository' === entity.type ||
                    'wiki' === entity.type ||
                    'chat' === entity.type ||
                    'forum' === entity.type) {
                    // Tracker, repo, wiki, chat or forum:
                    result = `<li class="list-group-item">
                        <a href="${buildLink(entity._links.self.href)}">
                            <code>${normaliseURI(entity.link)}</code>
                            <span class="suffix">(${entity.type})</span>
                        </a>
                    </li>`;
                } else if ('rss' === entity.type) {
                    // RSS:
                    result = `<li class="list-group-item">
                        <a href="${buildLink(entity._links.self.href)}">
                            <code>${normaliseURI(entity.link)}</code>
                            <span class="suffix">(RSS)</span>
                        </a>
                    </li>`;
                } else if ('twitter' === entity.type) {
                    // Twitter:
                    result = `<li class="list-group-item">
                        <a href="${buildLink(entity._links.self.href)}">
                            <code>${normaliseURI(entity.link)}</code>
                            <span class="suffix">(Twitter)</span>
                        </a>
                    </li>`;
                } else {
                    result = `<li class="list-group-item">[Unknown type of service]</li>\n`;
                }
            } else if (entity.hasOwnProperty('start') && entity.hasOwnProperty('end')) {
                // Charter:
                result = `<li class="list-group-item">\
                    <a href="${buildLink(entity._links.self.href)}">\
                        ${entity.start} &ndash; ${entity.end}\
                    </a>\
                </li>`;
            } else
                return '<li class="list-group-item">[Type of item not supported yet]</li>\n';
            return result;
        };

        /**
         * @TODO
         */

        var renderField = function(key, value, label) {
            if (undefined === key || undefined === value)
                return window.alert('Error: tried to render an undefined field')
            else {
                var humanValue;
                if ('string' === typeof NICE_LABELS[key])
                    humanValue = NICE_LABELS[key];
                else
                    humanValue = NICE_LABELS[key][type];
                if ('boolean' === typeof value)
                    return '<p><strong>' + humanValue + '</strong>: <span class="' +
                        (value ? 'yes">&#10003;' : 'no">&#10007;') +
                        '</span></p>\n';
                else if (REGEX_URI.test(value)) {
                    if (label)
                        return '<p><strong>' + humanValue + '</strong>: <a href="' + buildLink(value) + '">' + label + '</a></p>\n';
                    else if (value === buildLink(value))
                        return '<p><strong>' + humanValue + '</strong>: <a href="' + value + '"><code>' + normaliseURI(value) + '</code></a></p>\n';
                    else
                        return '<p><strong>' + humanValue + '</strong>: <a href="' + buildLink(value) + '">see</a></p>\n';
                } else if (REGEX_DATE.test(value))
                    return '<p><strong>' + humanValue + '</strong>: ' + value + '</p>\n';
                else if ('string' === typeof value)
                    return '<p><strong>' + humanValue + '</strong>: <em>' + value + '</em></p>\n';
                else
                    return '<p><strong>' + humanValue + '</strong>: [Type of field not supported yet]</p>\n';
            }
        };

        /**
         * @TODO
         */

        var renderPhoto = function(photos) {
            if (photos)
                for (var p of photos)
                    if ('thumbnail' === p.name)
                        return '<p class="pull-right"><img src="' + p.href + '" alt="Portrait of the user"></p>\n';
        };

        /**
         * @TODO
         */

        var buildAPIHandler = function(s) {
            return function(error, data) {
                if (error) {
                    return window.alert(`Error: "${error}"`);
                } else {
                    if (DEBUG)
                        console.debug(JSON.stringify(data, null, 4));
                    var humanValue,
                        widget = $('#sample-widget').clone(),
                        item;
                    if ('string' === typeof NICE_LABELS[s])
                        humanValue = NICE_LABELS[s];
                    else
                        humanValue = NICE_LABELS[s][type];
                    widget.attr('id', s).removeClass('sample');
                    $('h3', widget).contents()[0].textContent = humanValue + ' ';
                    $('h3 span.count', widget).text(data.length);
                    $('h3 a', widget).attr('href', '#' + s);
                    for(var i of data)
                        if (undefined !== i) {
                            item = $(renderItem(i, type));
                            $('.list-group', widget).append(item);
                        }
                    $('#details').append(widget);
                    showSection('details');
                }
                updateProgress(-1);
            };
        };

        /**
         * @TODO
         */

        var listEntities = function(list) {
            $('#about .panel-body').remove();
            var aboutSection = $('#about .list-group');
            for(var i of list) {
                aboutSection.append(renderItem(i, type));
                showSection('about');
            }
        };

        /**
         * @TODO
         */

        var buildFields = function(data) {
            $('#about .list-group').remove();
            var aboutSection = $('#about .panel-body');
            var fields = FIELDS[type],
                f;
            for(f of fields)
                if (undefined !== data[f]) {
                    aboutSection.append(renderField(f, data[f]));
                    showSection('about');
                }
            fields = DEEPFIELDS[type];
            for(f of fields) {
                if ('photos' === f) {
                    var photoSection = renderPhoto(data['_links'].photos);
                    if (photoSection) {
                        aboutSection.append(photoSection);
                        showSection('about');
                    }
                } else if (undefined !== data['_embedded'] && undefined !== data['embedded'][f]) {
                    aboutSection.append(renderField(f, data['_embedded'][f].href, data['_embedded'][f].title));
                    showSection('about');
                } else if (undefined !== data['_links'] && undefined !== data['_links'][f]) {
                    aboutSection.append(renderField(f, data['_links'][f].href, data['_links'][f].title));
                    showSection('about');
                }
            }
        };

        /**
         * @TODO
         */

        var fetchSections = function(data) {
            var sections = SECTIONS[type];
            var func, thisSec;
            if (TYPE_VERSION === type) {
                for(var s in sections) {
                    thisSec = sections[s];
                    updateProgress(1);
                    api.specification(id.s).version(id.v)[thisSec]().fetch(OPTS, buildAPIHandler(thisSec));
                }
            } else {
                if (TYPE_FUNCTION === type) {
                    func = api.function;
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
                    // @TODO: remove this condition; it's a workaround for https://github.com/w3c/w3c-api/issues/73
                    if ((TYPE_PARTICIPATION !== type || !data || !data.individual || 'participants' !== thisSec) &&
                        (TYPE_GROUP !== type || '7756' !== id || 'participations' !== thisSec)) {
                        updateProgress(1);
                        func(id)[thisSec]().fetch(OPTS, buildAPIHandler(thisSec));
                    }
                }
            }
        };

        /**
         * @TODO
         */

        var processEntity = function(error, data) {
            if (error) {
                return window.alert(`Error: "${error}"`);
            } else {
                if (DEBUG)
                    console.debug(JSON.stringify(data, null, 4));
                var name = '[Item]';
                if (undefined === id) {
                    name = 'All ';
                    if (TYPE_FUNCTION === type)
                        name += 'functions';
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
                    fetchSections(data);
                    buildFields(data);
                }
                var headTitle = $('head title');
                headTitle.html(headTitle.text() + ' &middot; ' + $('<span>' + name + '</span>').text());
                title.removeClass('loading').filter('a').html(name);
                $('h1').removeClass('loading')
                $('h1 a').html(name);
            }
            updateProgress(-1);
        };

        if (TYPE_FUNCTION === type) {
            updateProgress(1);
            if (id)
                api.function(id).fetch(OPTS, processEntity);
            else
                api.functions().fetch(OPTS, processEntity);
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

    var collapseNavBar = function() {
        $('.navbar-collapse').collapse('hide');
    };

    /**
     * @TODO
     */

    var showNotImplemented = function() {
        if (event && event.target &&
            'permalink' !== event.target.className && 'span' !== event.target.tagName.toLowerCase() &&
            (!event.which || 1 === event.which)) {
            $('#not-implemented').modal('show');
        }
    };

    /**
     * @TODO
     */

    var attachHandlers = function() {
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
        if (processURL()) {
            if (TYPE_GROUP === type && undefined !== id)
                showSection('dashboard');
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
        // jquery: 'https://code.jquery.com/jquery-2.2.4.min',
        jquery: 'https://code.jquery.com/jquery-2.2.4',
        // @TODO: switch to minified Bootstrap JS in production:
        // bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap',
        utils: 'utils'
    },
    shim: {
        'bootstrap': ['jquery']
    }
});

// Load dependencies asynchronously via RequireJS:
requirejs(['w3capi', 'jquery', 'bootstrap', 'utils'], init);
