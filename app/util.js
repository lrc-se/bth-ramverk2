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
    res.render("default/layout", {
        req: req,
        view: view,
        title: title || "",
        data: data || {}
    });
};


/**
 * Returns a person's current age, defaulting to that of the author.
 *
 * @param   {number}    [birthYear] Birth year.
 *
 * @returns {number}                Age in years, rounded up.
 */
api.getAge = function(birthYear) {
    return new Date().getFullYear() - (+birthYear || 1983);
};


module.exports = api;
