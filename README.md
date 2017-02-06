# Unitas

Prototypes for the &ldquo;dynamic pages&rdquo; project

## Examples

### &ldquo;Root&rdquo; view

With no arguments (or with *wrong* arguments): [`/`](https://w3c.github.io/Unitas/)

### Lists of entities that are &ldquo;listable&rdquo;

1. All functions: [`/?f=all`](https://w3c.github.io/Unitas/?f=all)
1. All groups: [`/?g=all`](https://w3c.github.io/Unitas/?g=all)
1. All specs: [`/?s=all`](https://w3c.github.io/Unitas/?s=all)
1. All affiliations: [`/?a=all`](https://w3c.github.io/Unitas/?a=all)

### Examples of particular Entities

1. A function: [`/?f=109`](https://w3c.github.io/Unitas/?f=109)
1. A group: [`/?g=68239`](https://w3c.github.io/Unitas/?g=68239)
1. A charter: [`/?g=46300&c=155`](https://w3c.github.io/Unitas/?g=46300&c=155)
1. A spec: [`/?s=dwbp`](https://w3c.github.io/Unitas/?s=dwbp)
1. A version: [`/?s=2dcontext&v=20110525`](https://w3c.github.io/Unitas/?s=2dcontext&v=20110525)
1. A user: [`/?u=ggdj8tciu9kwwc4o4ww888ggkwok0c8`](https://w3c.github.io/Unitas/?u=ggdj8tciu9kwwc4o4ww888ggkwok0c8)
1. A service: [`/?x=1913`](https://w3c.github.io/Unitas/?x=1913)
1. A participation: [`/?p=1503`](https://w3c.github.io/Unitas/?p=1503)
1. An affiliation: [`/?a=52794`](https://w3c.github.io/Unitas/?a=52794)

## Contributing

### How to test locally

1. Clone this repository and check out the desired branch.
1. Edit [this couple of lines at the beginning of `behaviour.js`](https://github.com/w3c/Unitas/blob/gh-pages/behaviour.js#L3-L4) to use your own API key (and,
  optionally, to enable debugging, so that useful messages are printed on the JavaScript console of your browser).
1. Serve the page (`index.html` and related resources) locally, setting up your local web server appropriately.
1. Use Unitas by visiting [`http://localhost/unitas/`](http://localhost/unitas/) (assuming that's where it's being served).
  (As all items are inter-linked, you can start anywhere and pretty much navigate your way to any other valid page in the system.
  But the root page `/` is a useful entry point.)

### About the API key

:warning: the [W3C API key](https://w3c.github.io/w3c-api/#apikeys) embedded in this project will work *from the domain `w3c.github.io` only*, as it is for
demonstration purposes on GitHub pages.
Make sure you [replace it](https://github.com/w3c/Unitas/blob/gh-pages/behaviour.js#L3) with your own API to use it with `localhost://` or other origins.

### Dependencies

Resources are loaded this way:

* [`index.html`](https://github.com/w3c/Unitas/blob/gh-pages/index.html)
  * CSS
    [`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css`](https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css)
  * CSS
    [`style.css`](https://github.com/w3c/Unitas/blob/gh-pages/style.css)
  * JS [`https://requirejs.org/docs/release/2.2.0/comments/require.js`](https://requirejs.org/docs/release/2.2.0/comments/require.js)
    * JS [`behaviour.js`](https://github.com/w3c/Unitas/blob/gh-pages/behaviour.js)
        * JS [`https://w3c.github.io/node-w3capi/lib/w3capi.js`](https://w3c.github.io/node-w3capi/lib/w3capi.js)
        * JS [`https://code.jquery.com/jquery-2.2.3.js`](https://code.jquery.com/jquery-2.2.3.js)
        * JS
          [`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.js`](https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.js)
        * JS [`utils.js`](https://github.com/w3c/Unitas/blob/gh-pages/utils.js)

This cascading is far from optimal, of course.
It is useful during development and for debugging, though.

In production, resources will be concatenated and loaded in parallel, and minified/compressed versions of CSS/JS libraries will be used instead.

## Related projects on GitHub

* [w3c-api](https://github.com/w3c/w3c-api): the W3C API.
  * [node-w3capi](https://github.com/w3c/node-w3capi): a JS client for the W3C API.
  * [apiary](https://github.com/w3c/apiary): a simple JS library to use the W3C API in a declarative way.
* About \[re\]design:
  * [mailing-list-archives](https://github.com/w3c/mailing-list-archives): modernising W3C's mailing list archives.
  * [wbs-design](https://github.com/w3c/wbs-design): pretiffy the WBS UI (polls and surveys).
  * [tr-design](https://github.com/w3c/tr-design): new style sheets used by W3C technical reports in 2016.
  * [design](https://github.com/w3c/design): templates, mockups, proposals and design-related material.
* [midgard](https://github.com/w3c/midgard): dashboard for the dwellers of our world.

## Other resources

* [&ldquo;Group dashboards&rdquo; wiki page](https://www.w3.org/wiki/GroupDashboards).
* [Modern tooling, &sect;4.2: &ldquo;dashboard&rdquo;](https://w3c.github.io/modern-tooling/#dashboard).

## Credits

Copyright &copy; 2016&ndash;2017 [World Wide Web Consortium](https://www.w3.org/).

This project is licensed [under the terms of the MIT license](LICENSE.md).
