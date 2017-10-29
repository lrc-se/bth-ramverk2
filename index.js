#!/usr/bin/env node

"use strict";

var app = require("./app/app");


// start server
var port = (!isNaN(process.env.DBWEBB_PORT) ? +process.env.DBWEBB_PORT : 1337);
app.listen(port);
console.log("Server running on port " + port);
