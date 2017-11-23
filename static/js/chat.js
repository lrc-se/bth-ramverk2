(function(win, doc) {
    "use strict";
    
    var nickForm = doc.getElementById("nick-form");
    var chatForm = doc.getElementById("chat-form");
    var chatRoll = doc.getElementById("chat-roll");
    var chatList = doc.getElementById("chat-list");
    var nick;
    var ws;
    
    
    function connect(e) {
        e.preventDefault();
        
        nick = nickForm.nick.value;
        if (!nick) {
            alert("Du måste ange ett smeknamn.");
            return;
        }
        
        var url = nickForm.url.value;
        if (!url) {
            alert("Du måste ange en serveradress.");
            return;
        }
        
        try {
            ws = new WebSocket(url, "v1");
        } catch (ex) {
            alert("Kunde inte öppna anslutningen. Felmeddelande:\n\n" + ex.message);
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
                    doc.getElementById("chat-container").style.display = "flex";
                    nickForm.nick.disabled = true;
                    nickForm.url.disabled = true;
                    nickForm.connect.disabled = true;
                    nickForm.disconnect.disabled = false;
                    win.scrollTo(0, chatForm.offsetTop);
                    chatForm.msg.focus();
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
                alert("Anslutningen stängdes ner. Meddelande:\n\n" + e.reason);
            }
            
            doc.getElementById("chat-container").style.display = "none";
            nickForm.nick.disabled = false;
            nickForm.url.disabled = false;
            nickForm.connect.disabled = false;
            nickForm.disconnect.disabled = true;
            nickForm.style.display = "block";
            chatRoll.innerHTML = "";
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
            msg.innerHTML = "<strong>* " + data.msg + "</strong>";
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
    
    
    nickForm.addEventListener("submit", connect);
    nickForm.disconnect.addEventListener("click", function() {
        if (ws) {
            ws.close();
            ws = null;
        }
    });
    chatForm.addEventListener("submit", sendMessage);
})(window, document);
