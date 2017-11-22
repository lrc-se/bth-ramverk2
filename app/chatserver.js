/**
 * Chat server.
 *
 * @module  app/chatserver
 */

"use strict";

const wsServer = require("./ws-server");


var server;
var clients = {};


function handleProtocols(protocols) {
    return (~protocols.indexOf("v1") ? "v1" : false);
}


function handleConnection(client) {
    console.log(`Client connected (${client.request.connection.remoteAddress})`);
}


function handleMessage(data, client) {
    console.log(`Received message (${client.request.connection.remoteAddress}):`, data);
    
    try {
        data = JSON.parse(data);
    } catch (ex) {
        console.error("Illegal message format");
        return;
    }
    
    let socket = client.socket;
    switch (data.cmd) {
        case "nick": {
            let nick = data.data;
            if (clients[nick]) {
                sendCmd(socket, "unwelcome", null);
                socket.close();
                return;
            }
            
            socket.nick = nick;
            clients[nick] = socket;
            sendCmd(socket, "welcome", null);
            broadcastCmd("users", Object.keys(clients));
            broadcastMessage(`${nick} har anslutit sig`);
            break;
        }
        case "msg":
            broadcastMessage(data.data, socket);
            break;
    }
}


function handleError(err, client) {
    console.error(`Socket error (${client.request.connection.remoteAddress}):`, err);
}


function handleDisconnection(code, reason, client) {
    console.log(`Client disconnected (${client.request.connection.remoteAddress}):`, code, reason);
    
    let nick = client.socket.nick;
    if (clients[nick]) {
        delete clients[nick];
        broadcastCmd("users", Object.keys(clients));
        broadcastMessage(`${nick} har lämnat chatten`);
    }
}


function broadcastMessage(msg, socket) {
    let data = {
        time: new Date(),
        msg: msg
    };
    if (socket) {
        data.user = socket.nick;
    }
    broadcastCmd("msg", data, socket);
}


function sendCmd(socket, cmd, data) {
    server.sendJSON(socket, {
        cmd: cmd,
        data: data
    });
}

function broadcastCmd(cmd, data, socket) {
    server.broadcastJSON({
        cmd: cmd,
        data: data
    }, socket);
}


const ChatServer = {
    /**
     * Initializes the server.
     *
     * @param   {http.Server}   httpServer  HTTP server instance.
     */
    init: function(httpServer) {
        server = wsServer({
            server: httpServer,
            protocolHandler: handleProtocols,
            connectionHandler: handleConnection,
            messageHandler: handleMessage,
            errorHandler: handleError,
            closeHandler: handleDisconnection
        });
    }
};


module.exports = ChatServer;
