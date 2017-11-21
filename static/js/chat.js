(function(doc) {
    "use strict";
    
    var nickForm = doc.getElementById("nick-form");
    var chatForm = doc.getElementById("chat-form");
    var chatRoll = doc.getElementById("chat-roll");
    var ws;
    
    
    function connect(e) {
        e.preventDefault();
        
        var nick = nickForm.nick.value;
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
            ws = new WebSocket(url);
        } catch (ex) {
            alert("Kunde inte öppna anslutningen. Felmeddelande:\n\n" + ex.message);
            return;
        }
        
        ws.onopen = function() {
            doc.getElementById("chat-container").style.display = "block";
            nickForm.nick.disabled = true;
            nickForm.url.disabled = true;
            nickForm.connect.disabled = true;
            nickForm.disconnect.disabled = false;
        };
        ws.onmessage = function(e) {
            addMessage(e.data);
        };
        ws.onclose = function() {
            doc.getElementById("chat-container").style.display = "none";
            nickForm.nick.disabled = false;
            nickForm.url.disabled = false;
            nickForm.connect.disabled = false;
            nickForm.disconnect.disabled = true;
            nickForm.style.display = "block";
            chatRoll.innerHTML = "";
        };
    }
    
    function addMessage(msg) {
        var div = doc.createElement("div");
        div.className = "chat-msg";
        div.textContent = msg;
        chatRoll.appendChild(div);
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
        
        addMessage(msg);
        ws.send(msg);
        chatForm.msg.value = "";
    }
    
    
    nickForm.addEventListener("submit", connect);
    nickForm.disconnect.addEventListener("click", function() {
        if (ws) {
            ws.close();
            ws = null;
        }
    });
    chatForm.addEventListener("submit", sendMessage);
})(document);
