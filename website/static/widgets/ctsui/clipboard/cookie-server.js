//This code is loaded by the cookie server html document

CookieServer = {};

CookieServer.setCookie = function(name,value,days) {
    var expires;
    if (days) {
	var date = new Date();
	date.setTime(date.getTime()+(days*24*60*60*1000));
	expires = "; expires="+date.toGMTString();
    }
    else expires = "";
    var setting = name+"="+encodeURIComponent(value)+expires+"; path=/";
    document.cookie = setting;
};

CookieServer.getCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(/;\s*/);
    for(var i=0;i < ca.length;i++) {
	var c = ca[i];
	if (c.indexOf(nameEQ) == 0) 
	    return decodeURIComponent(c.substring(nameEQ.length,c.length));
    }
    return null;
};

CookieServer.receive = function (event) {
    var msg = event.data;
    if (event.source === window.parent) {
	if (msg.cmd === "set") {
	    CookieServer.setCookie(msg.name, msg.value, msg.days);
	} else if (msg.cmd = "get") {
	    event.source.postMessage(CookieServer.getCookie(msg.name),"*");
	}
    }
};

window.addEventListener("message",CookieServer.receive, false);

if (window.parent !== window) {
    //loaded in iframe for actual usage as opposed to testing
    //so notify loader
    window.parent.postMessage("loaded","*");
};

