if (typeof ubi === "undefined") {
  ubi = {};
}

ubi.console.log("Initialising client socket module");

ubi.ClientSocket = function(user) {
  this.ws = null;
  this.msgId = 0;
  this.callbacks = {};
  this.user = user;
}

ubi.ClientSocket.prototype.connect = function (port, callback) {
  var self = this;
  self.ws  = new WebSocket("ws://" + window.location.hostname + ":" + port);

  self.ws.onopen = function() {
    if (typeof callback === "function") {
      callback();
    }
  };

  self.ws.onmessage = function(message) {
    var msg = JSON.parse(message.data);
    if (typeof msg.id !== "undefined") {
      if (msg.id in self.callbacks) {
        self.callbacks[msg.id](msg.result);
      } else {
        ubi.console.log("No callback for msg with id " + msg.id + " : " + msg,ubi.console.error);
      }
    } else {
      // Call initiated by server?
    }
  };

  self.ws.onclose = function() {
    self.ws = null;
  }
};

ubi.ClientSocket.prototype.send = function (data, callback) {
  if (this.ws) {
    var msg = { user: this.user, message: data };
    if (typeof callback === "function") {
      msg.id = this.msgId++;
      this.callbacks[msg.id] = callback;
    }
    var jsonStr = JSON.stringify(msg);
    this.ws.send(jsonStr);
  }
};
