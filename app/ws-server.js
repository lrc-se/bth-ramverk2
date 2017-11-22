/**
 * Web Sockets server.
 *
 * @module  app/ws-server
 */

"use strict";

const ws = require("ws");


/**
 * Server object prototype.
 */
const wsServerProto = {
    /**
     * Underlying Web Sockets server instance.
     *
     * @type    {WebSocket.Server}
     */
    server: null,
    
    
    /**
     * Broadcasts a message to all connected clients.
     *
     * @param   {string}    data        Message to send.
     * @param   {WebSocket} [exclude]   Web socket instance to exclude from broadcast (if any).
     */
    broadcast: function broadcast(data, exclude) {
        this.server.clients.forEach(function(client) {
            if (exclude === client || client.readyState !== ws.OPEN) {
                return;
            }
            client.send(data);
        });
    },
    
    
    /**
     * Sends a JSON object to a specific client.
     *
     * @param   {WebSocket} socket  Web socket instance to send to.
     * @param   {object}    data    Object to send.
     */
    sendJSON: function sendJSON(socket, data) {
        socket.send(JSON.stringify(data));
    },
    
    
    /**
     * Broadcasts a JSON object to all connected clients.
     *
     * @param   {object}    data        Object to send.
     * @param   {WebSocket} [exclude]   Web socket instance to exclude from broadcast (if any).
     */
    broadcastJSON: function broadcastJSON(data, exclude) {
        this.broadcast(JSON.stringify(data), exclude);
    }
};


/**
 * Creates a new server instance.
 *
 * @param   {object}        config                      Configuration object:
 * @param   {http.Server}   config.server                 HTTP server instance.
 * @param   {function}      [config.protocolHandler]      Protocol selection handler.
 * @param   {function}      [config.connectionHandler]    Connection handler.
 * @param   {function}      [config.messageHandler]       Message reception handler.
 * @param   {function}      [config.errorHandler]         Error handler.
 * @param   {function}      [config.closeHandler]         Disconnection handler.
 */
function createServer(config) {
    let wsConfig = {
        server: config.server,
        clientTracking: true
    };
    if (config.protocolHandler) {
        wsConfig.handleProtocols = config.protocolHandler;
    }
    
    let server = new ws.Server(wsConfig);
    server.on("connection", function(socket, req) {
        handleConnection(socket, req, config);
    });
    
    let wsServer = Object.create(wsServerProto);
    wsServer.server = server;
    return wsServer;
}


/**
 * Handles an incoming connection.
 *
 * @param   {WebSocket}             socket  Web socket instance.
 * @param   {http.IncomingMessage}  req     Request object.
 * @param   {object}                config  Server instance configuration object.
 */
function handleConnection(socket, req, config) {
    let client = {
        socket: socket,
        request: req
    };
    
    // call connection handler, if any
    if (typeof config.connectionHandler == "function") {
        config.connectionHandler(client);
    }
    
    // set up message handler, if any
    if (typeof config.messageHandler == "function") {
        socket.on("message", function(data) {
            config.messageHandler(data, client);
        });
    }
    
    // set up error handler, if any
    if (typeof config.errorHandler == "function") {
        socket.on("error", function(err) {
            config.errorHandler(err, client);
        });
    }
    
    // set up disconnection handler, if any
    if (typeof config.closeHandler == "function") {
        socket.on("close", function(code, reason) {
            config.closeHandler(code, reason, client);
        });
    }
}


module.exports = createServer;
