"use strict";

var api = {};

api.renderLayout = function(req, res, view, title, data) {
    res.render("layout", {
        req: req,
        view: view,
        title: title || "",
        data: data || {}
    });
};


module.exports = api;
