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
            broadcastMessage(`${nick} har anslutit sig`, null, socket);
            sendMessage(socket, "Välkommen till chatten!");
            break;
        }
        case "msg":
            broadcastMessage(data.data, socket, socket);
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


function buildMessage(msg, from) {
    let data = {
        time: new Date(),
        msg: msg
    };
    if (from) {
        data.user = from.nick;
    }
    return data;
}


function sendMessage(to, msg, from) {
    sendCmd(to, "msg", buildMessage(msg, from));
}


function broadcastMessage(msg, from, exclude) {
    broadcastCmd("msg", buildMessage(msg, from), exclude);
}


function sendCmd(to, cmd, data) {
    server.sendJSON(to, {
        cmd: cmd,
        data: data
    });
}


function broadcastCmd(cmd, data, exclude) {
    server.broadcastJSON({
        cmd: cmd,
        data: data
    }, exclude);
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
