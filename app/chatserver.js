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
        broadcast(data, socket);
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


/**
 * Broadcasts a message to all connected clients.
 *
 * @param   {object}    data        Message to send.
 * @param   {WebSocket} [socket]    Web socket instance to exclude from broadcast (if any).
 */
function broadcast(data, socket) {
    server.clients.forEach(function(client) {
        if (socket === client || client.readyState !== ws.OPEN) {
            return;
        }
        client.send(data);
    });
}


const ChatServer = {
    /**
     * Initializes the server.
     *
     * @param   {http.Server}   httpServer  HTTP server instance.
     */
    init: function(httpServer) {
        server = new ws.Server({
            server: httpServer,
            clientTracking: true
        });
        server.on("connection", handleConnection);
    }
};


module.exports = ChatServer;
