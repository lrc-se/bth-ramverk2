/**
 * Chat server.
 *
 * @module  app/chatserver
 */

"use strict";

const ws = require("ws");


var server;


/**
 * Handles an incoming connection.
 *
 * @param   {WebSocket}             socket  Web socket instance.
 * @param   {http.IncomingMessage}  req     Request object.
 */
function handleConnection(socket, req) {
    let ip = req.connection.remoteAddress;
    console.log(`Client connected (${ip})`);
    
    // message handler
    socket.on("message", function(data) {
        console.log(`Received message (${ip}):`, data);
    });
    
    // error handler
    socket.on("error", function(err) {
        console.error(`Socket error (${ip}):`, err);
    });
    
    // disconnection handler
    socket.on("close", function(code, reason) {
        console.log(`Client disconnected (${ip}):`, code, reason);
    });
}


const ChatServer = {
    /**
     * Initializes the server.
     *
     * @param   {http.Server}   httpServer  HTTP server instance.
     */
    init: function(httpServer) {
        server = new ws.Server({ server: httpServer });
        server.on("connection", handleConnection);
    }
};


module.exports = ChatServer;
