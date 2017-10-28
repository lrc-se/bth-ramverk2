#!/usr/bin/env node

"use strict";

const express = require("express");
//const ejs = require("ejs");
const path = require("path");

var app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));


function renderLayout(res, view, title, data) {
    res.render("layout", {
        view: view,
        title: title || "",
        data: data || {}
    });
}


app.get("/", function(req, res) {
    renderLayout(res, "index", "Kalles sida");
});

app.get("/about", function(req, res) {
    renderLayout(res, "about", "Om webbplatsen");
});

app.get("/report", function(req, res) {
    renderLayout(res, "report", "Redovisningar");
});

app.use(function(req, res, next) {
    var err = new Error("404 Not Found");
    err.status = 404;
    next(err);
});


var port = (!isNaN(process.env.DBWEBB_PORT) ? +process.env.DBWEBB_PORT : 1337);
app.listen(port);
console.log("Server running on port " + port);
