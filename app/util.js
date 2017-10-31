/**
 * Utility functions.
 *
 * @module  app/util
 */

"use strict";

var api = {};


/**
 * Renders a standard layout using EJS templates.
 *
 * @param   {object}    req     Request object.
 * @param   {object}    res     Response object.
 * @param   {string}    view    View template file to render as body.
 * @param   {string}    [title] Page title.
 * @param   {object}    [data]  Template data.
 */
api.renderLayout = function(req, res, view, title, data) {
    res.render("layout", {
        req: req,
        view: view,
        title: title || "",
        data: data || {}
    });
};


module.exports = api;
