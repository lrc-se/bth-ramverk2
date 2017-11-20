#!/usr/bin/env node

/**
 * Web application startup.
 */

"use strict";

const http = require("http");
const app = require("./app/app");
const chatServer = require("./app/chatserver");


// create server
var server = http.createServer(app);
chatServer.init(server);

// start server
var port = (!isNaN(process.env.DBWEBB_PORT) ? +process.env.DBWEBB_PORT : 1337);
server.listen(port, function(err) {
    if (err) {
        console.error("Error starting server:", err);
        return;
    }
    console.log("Server running on port " + port);
});
