(function(win, doc) {
    "use strict";
    
    var connectForm = doc.getElementById("connect-form");
    var chatForm = doc.getElementById("chat-form");
    var chatRoll = doc.getElementById("chat-roll");
    var chatList = doc.getElementById("chat-list");
    var nick;
    var ws;
    
    
    function showChat() {
        doc.getElementById("chat-container").style.display = "flex";
        connectForm.nick.disabled = true;
        connectForm.url.disabled = true;
        connectForm.connect.disabled = true;
        connectForm.disconnect.disabled = false;
        win.scrollTo(0, chatForm.offsetTop);
        chatForm.msg.focus();
    }
    
    function hideChat() {
        doc.getElementById("chat-container").style.display = "none";
        connectForm.nick.disabled = false;
        connectForm.url.disabled = false;
        connectForm.connect.disabled = false;
        connectForm.disconnect.disabled = true;
        connectForm.style.display = "block";
        chatRoll.innerHTML = "";
        chatForm.msg.value = "";
    }
    
    function connect(e) {
        e.preventDefault();
        
        nick = connectForm.nick.value;
        if (!nick) {
            alert("Du måste ange ett smeknamn.");
            return;
        }
        
        var url = connectForm.url.value;
        if (!url) {
            alert("Du måste ange en serveradress.");
            return;
        }
        
        try {
            ws = new WebSocket(url, "v1");
        } catch (ex) {
            alert(
                "Kunde inte öppna anslutningen." +
                (ex.message ? "Felmeddelande: " + ex.message : "")
            );
            return;
        }
        
        ws.onopen = function() {
            sendCmd("nick", nick);
        };
        
        ws.onmessage = function(e) {
            var data;
            try {
                data = JSON.parse(e.data);
            } catch (ex) {
                console.error("Illegal message format:", e.data);
                return;
            }
            
            switch (data.cmd) {
                case "welcome":
                    showChat();
                    break;
                case "unwelcome":
                    alert("Smeknamnet är upptaget.");
                    break;
                case "msg":
                    addMessage(data.data);
                    break;
                case "users":
                    showUsers(data.data);
                    break;
                default:
                    console.error("Unknown message:", data);
            }
        };
        
        ws.onclose = function(e) {
            if (e.code !== 1000) {
                alert(
                    "Anslutningen stängdes ner." +
                    (e.reason ? "Meddelande: " + e.reason : "")
                );
            }
            hideChat();            
        };
    }
    
    function sendCmd(cmd, data) {
        ws.send(JSON.stringify({
            cmd: cmd,
            data: data
        }));
    }
    
    function addMessage(data) {
        var div = doc.createElement("div");
        var from = doc.createElement("div");
        var msg = doc.createElement("div");
        
        from.textContent = "[" + new Date(data.time).toTimeString().substring(0, 8) + "]";
        if (data.user) {
            msg.textContent = "<" + data.user + "> " + data.msg;
        } else {
            var strong = doc.createElement("strong");
            strong.textContent = "* " + data.msg;
            msg.appendChild(strong);
        }
        
        div.className = "chat-msg";
        div.appendChild(from);
        div.appendChild(msg);
        chatRoll.appendChild(div);
        chatRoll.scrollTop = chatRoll.scrollHeight;
    }
    
    function showUsers(users) {
        users.sort(function(str1, str2) {
            return (str1.toLocaleLowerCase() < str2.toLocaleLowerCase() ? -1 : 1);
        });
        var frag = doc.createDocumentFragment();
        users.forEach(function(user) {
            var div = doc.createElement("div");
            div.textContent = user;
            frag.appendChild(div);
        });
        chatList.innerHTML = "";
        chatList.appendChild(frag);
    }
        
    function sendMessage(e) {
        e.preventDefault();
        
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("Ej ansluten till någon server.");
            return;
        }
        
        var msg = chatForm.msg.value;
        if (!msg) {
            return;
        }
        
        addMessage({
            time: new Date(),
            user: nick,
            msg: msg
        });
        sendCmd("msg", msg);
        chatForm.msg.value = "";
        chatForm.msg.focus();
    }
    
    
    connectForm.addEventListener("submit", connect);
    connectForm.disconnect.addEventListener("click", function() {
        if (ws) {
            ws.close();
            ws = null;
        }
    });
    chatForm.addEventListener("submit", sendMessage);
})(window, document);
