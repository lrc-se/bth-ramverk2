/**
 * Chat server test.
 */

"use strict";

const tap = require("tap");
const http = require("http");
const chatServer = require("../app/chatserver");
const WebSocket = require("ws");


const port = 1701;
var server = http.createServer();
chatServer.init({ server });


function connect(nick) {
    let socket = new WebSocket("ws://localhost:" + port, "v1");
    socket.onopen = function() {
        sendCmd(socket, "nick", nick);
    };
    return socket;
}


function sendCmd(socket, cmd, data) {
    socket.send(JSON.stringify({
        cmd: cmd,
        data: data
    }));
}


tap.beforeEach(function(done) {
    server.listen(port, done);
});


tap.afterEach(function(done) {
    server.close(done);
});


tap.tearDown(process.exit);


tap.test("Test single user", function(t) {
    let status = 0;
    
    let socket = connect("John Doe");
    socket.onmessage = function(e) {
        let data = JSON.parse(e.data);
        switch (status++) {
            case 0:
                t.equal(data.cmd, "welcome", "nick accepted");
                break;
            case 1:
                t.equal(data.cmd, "users", "user list received");
                t.same(data.data, ["John Doe"], '- user list contains "John Doe" only');
                break;
            case 2:
                t.equal(data.cmd, "msg", "message received");
                t.notEqual(new Date(data.data.time), "Invalid Date", "- timestamp is valid");
                t.equal(data.data.user, undefined, "- no sending user (server message)");
                t.equal(data.data.msg, "Välkommen till chatten!", "- message is welcome message");
                socket.close();
                t.end();
                break;
        }
    };
});


tap.test("Test duplicate nick", function(t) {
    let socket = connect("John Doe");
    socket.onmessage = function(e) {
        let data = JSON.parse(e.data);
        if (data.cmd == "welcome") {
            let socket2 = connect("John Doe");
            socket2.onmessage = function(e2) {
                let data2 = JSON.parse(e2.data);
                t.equal(data2.cmd, "unwelcome", 'nick "John Doe" rejected');
                socket2.close();
                socket.close();
                t.end();
            };
        }
    };
});


tap.test("Test multiple users", function(t) {
    let status1 = 0;
    let status2 = 0;
    
    let socket = connect("John Doe");
    let socket2;
    socket.onmessage = function(e) {
        let data = JSON.parse(e.data);
        if (status1 == 0 && data.cmd != "msg") {
            return;
        }
        switch (status1++) {
            case 0:
                socket2 = connect("Jane Doe");
                socket2.onmessage = function(e2) {
                    let data2 = JSON.parse(e2.data);
                    switch (status2++) {
                        case 0:
                            t.equal(data2.cmd, "welcome", "Jane: nick accepted");
                            break;
                        case 1:
                            t.equal(data2.cmd, "users", "Jane: user list received");
                            t.same(
                                data2.data,
                                ["John Doe", "Jane Doe"],
                                '- Jane: user list contains "John Doe" and "Jane Doe"'
                            );
                            break;
                        case 2:
                            t.equal(data2.cmd, "msg", "Jane: message received");
                            t.notEqual(
                                new Date(data.data.time),
                                "Invalid Date",
                                "- Jane: timestamp is valid"
                            );
                            t.equal(
                                data2.data.user,
                                undefined,
                                "- Jane: no sending user (server message)"
                            );
                            t.equal(
                                data2.data.msg,
                                "Välkommen till chatten!",
                                "- Jane: message is welcome message"
                            );
                            
                            sendCmd(socket2, "msg", "The cake is a lie");
                            break;
                    }
                };
                break;
            case 1:
                t.equal(data.cmd, "users", "John: user list received");
                t.same(
                    data.data,
                    ["John Doe", "Jane Doe"],
                    '- John: user list contains "John Doe" and "Jane Doe"'
                );
                break;
            case 2:
                t.equal(data.cmd, "msg", "John: message received");
                t.notEqual(new Date(data.data.time), "Invalid Date", "- John: timestamp is valid");
                t.equal(data.data.user, undefined, "- John: no sending user (server message)");
                t.equal(
                    data.data.msg,
                    "Jane Doe har anslutit sig",
                    '- John: message is join message for "Jane Doe"'
                );
                break;
            case 3:
                t.equal(data.cmd, "msg", "John: message received");
                t.notEqual(new Date(data.data.time), "Invalid Date", "- John: timestamp is valid");
                t.equal(data.data.user, "Jane Doe", '- John: sending user is "Jane Doe"');
                t.equal(data.data.msg, "The cake is a lie", "- John: message matches sent message");
                
                socket2.close();
                break;
            case 4:
                t.equal(data.cmd, "users", "John: user list received");
                t.same(data.data, ["John Doe"], '- John: user list contains "John Doe" only');
                break;
            case 5:
                t.equal(data.cmd, "msg", "John: message received");
                t.notEqual(new Date(data.data.time), "Invalid Date", "- John: timestamp is valid");
                t.equal(data.data.user, undefined, "- John: no sending user (server message)");
                t.equal(
                    data.data.msg,
                    "Jane Doe har lämnat chatten",
                    '- John: message is quit message for "Jane Doe"'
                );
                
                socket.close();
                t.end();
                break;
        }
    };
});
