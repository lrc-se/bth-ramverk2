/**
 * Chat server.
 *
 * @module  app/chatserver
 */

"use strict";

const wsServer = require("./ws-server");


var server;
var clients = {};
var log = false;


/**
 * Handles socket protocol requests.
 *
 * @param   {Array}     protocols   List of requested protocols.
 *
 * @returns {string|false}          Selected protocol, or false if no supported protocol found.
 */
function handleProtocols(protocols) {
    return (~protocols.indexOf("v1") ? "v1" : false);
}


/**
 * Handles client connection.
 *
 * @param   {object}    client  Client object.
 */
function handleConnection(client) {
    log && console.log(`Client connected (${client.request.connection.remoteAddress})`);
}


/**
 * Handles client message.
 *
 * @param   {string}    data    Message contents.
 * @param   {object}    client  Client object.
 */
function handleMessage(data, client) {
    log && console.log(`Received message (${client.request.connection.remoteAddress}):`, data);
    
    try {
        data = JSON.parse(data);
    } catch (ex) {
        log && console.error("Illegal message format");
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


/**
 * Handles client error.
 *
 * @param   {Error}     err     Error object.
 * @param   {object}    client  Client object.
 */
function handleError(err, client) {
    log && console.error(`Socket error (${client.request.connection.remoteAddress}):`, err);
}


/**
 * Handles client disconnection.
 *
 * @param   {number}    code    Closing code.
 * @param   {string}    reason  Closing reason.
 * @param   {object}    client  Client object.
 */
function handleDisconnection(code, reason, client) {
    let ip = client.request.connection.remoteAddress;
    if (!client.socket.pingPending) {
        log && console.log(`Client disconnected (${ip}):`, code, reason);
    } else {
        log && console.log(`Ping timeout (${ip})`);
    }
    
    let nick = client.socket.nick;
    if (clients[nick]) {
        delete clients[nick];
        broadcastCmd("users", Object.keys(clients));
        if (!client.socket.pingPending) {
            broadcastMessage(`${nick} har lämnat chatten`);
        } else {
            broadcastMessage(`${nick} har kopplats från p.g.a. ping-timeout`);
        }
    }
}


/**
 * Builds a chat message for sending.
 *
 * @param   {string}    msg     Message to send.
 * @param   {WebSocket} from    Sending client socket.
 *
 * @returns {object}            Populated message object.
 */
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


/**
 * Sends a chat message to a specified client.
 *
 * @param   {WebSocket} to      Receiving client socket.
 * @param   {string}    msg     Message to send.
 * @param   {WebSocket} [from]  Sending client socket, if any.
 */
function sendMessage(to, msg, from) {
    sendCmd(to, "msg", buildMessage(msg, from));
}


/**
 * Broadcasts a chat message to all connected clients.
 *
 * @param   {string}    msg         Message to send.
 * @param   {WebSocket} from        Sending client socket.
 * @param   {WebSocket} [exclude]   Client socket to exclude from broadcast, if any.
 */
function broadcastMessage(msg, from, exclude) {
    broadcastCmd("msg", buildMessage(msg, from), exclude);
}


/**
 * Sends a protocol command to a specified client.
 *
 * @param   {WebSocket} to      Receiving client socket.
 * @param   {string}    cmd     Command to send.
 * @param   {object}    data    Data payload.
 */
function sendCmd(to, cmd, data) {
    server.sendJSON(to, {
        cmd: cmd,
        data: data
    });
}


/**
 * Broadcasts a protocol command to all connected clients.
 *
 * @param   {string}    cmd         Command to send.
 * @param   {object}    data        Data payload.
 * @param   {WebSocket} [exclude]   Client socket to exclude from broadcast, if any.
 */
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
     * @param   {object}        config          Configuration object:
     * @param   {http.Server}   config.server     HTTP server instance.
     * @param   {number}        [config.timeout]  Ping timeout in milliseconds (defaults to 30000).
     * @param   {boolean}       [config.log]      Whether to output log messages to console.
     */
    init: function(config) {
        server = wsServer({
            server: config.server,
            timeout: (config.timeout !== undefined ? config.timeout : 30000),
            protocolHandler: handleProtocols,
            connectionHandler: handleConnection,
            messageHandler: handleMessage,
            errorHandler: handleError,
            closeHandler: handleDisconnection
        });
        log = !!config.log;
    }
};


module.exports = ChatServer;
