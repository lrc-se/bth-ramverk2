/**
 * Chat server.
 *
 * @module  app/chatserver
 */

"use strict";

const ws = require("ws");


var server;
var nicks = new Set();


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
        
        try {
            data = JSON.parse(data);
        } catch (ex) {
            console.error("Illegal message format");
            return;
        }
        
        switch (data.cmd) {
            case "nick":
                let nick = data.data;
                if (nicks.has(nick)) {
                    sendCmd(socket, "unwelcome", null);
                    socket.close();
                    return;
                }
                
                socket.nick = nick;
                nicks.add(nick);
                sendCmd(socket, "welcome", null);
                broadcastMessage(`${nick} har anslutit sig`);
                break;
            case "msg":
                broadcastMessage(data.data, socket);
                break;
        }
    });
    
    // error handler
    socket.on("error", function(err) {
        console.error(`Socket error (${ip}):`, err);
    });
    
    // disconnection handler
    socket.on("close", function(code, reason) {
        console.log(`Client disconnected (${ip}):`, code, reason);
        if (nicks.has(socket.nick)) {
            nicks.delete(socket.nick);
            broadcastMessage(`${socket.nick} har lämnat chatten`);
        }
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


function broadcastMessage(msg, socket) {
    let data = {
        time: new Date(),
        msg: msg
    };
    if (socket) {
        data.user = socket.nick;
    }
    broadcast(JSON.stringify({
        cmd: "msg",
        data: data
    }), socket);
}


function sendCmd(socket, cmd, data) {
    socket.send(JSON.stringify({
        cmd: cmd,
        data: data
    }));
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
