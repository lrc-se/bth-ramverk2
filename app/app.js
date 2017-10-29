"use strict";

const express = require("express");
const path = require("path");
const util = require("./util");


// init
var app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../static")));

// set up routes
require("../routes/routes").setup(app);

// set up 404
app.use(function(req, res, next) {
    let err = new Error("404 Not Found");
    err.status = 404;
    next(err);
});

// set up error handler
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    
    let title;
    switch (err.status) {
        case 403:
            title = "Behörighet saknas";
            break;
        case 404:
            title = "Kunde inte hitta sidan";
            break;
        case 500:
            title = "Serverfel";
            break;
        default:
            title = "Något gick fel";
    }
    
    res.status(err.status || 500);
    util.renderLayout(req, res, "error", "Fel", {
        title: title,
        err: (req.app.get("env") == "development" ? err : null)
    });
});


module.exports = app;
