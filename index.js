#!/usr/bin/env node

"use strict";

const express = require("express");
const path = require("path");

var app = express();

app.use(express.static(path.join(__dirname, "static")));

app.use(function(req, res, next) {
    var err = new Error("404 Not Found");
    err.status = 404;
    next(err);
});

var port = (!isNaN(process.env.DBWEBB_PORT) ? +process.env.DBWEBB_PORT : 1337);
app.listen(port);
console.log("Server running on port " + port);
