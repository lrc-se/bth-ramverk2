#!/usr/bin/env node

"use strict";

const express = require("express");
const path = require("path");

var app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));


function renderLayout(req, res, view, title, data) {
    res.render("layout", {
        req: req,
        view: view,
        title: title || "",
        data: data || {}
    });
}


app.get("/", function(req, res) {
    renderLayout(req, res, "index", "Kalles sida");
});

app.get("/about", function(req, res) {
    renderLayout(req, res, "about", "Om webbplatsen");
});

app.get("/report", function(req, res) {
    renderLayout(req, res, "report", "Redovisningar");
});

app.use(function(req, res, next) {
    var err = new Error("404 Not Found");
    err.status = 404;
    next(err);
});


var port = (!isNaN(process.env.DBWEBB_PORT) ? +process.env.DBWEBB_PORT : 1337);
app.listen(port);
console.log("Server running on port " + port);
