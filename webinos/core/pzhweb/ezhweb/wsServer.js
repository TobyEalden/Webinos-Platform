(function() {
  var websocketServer = require("websocket").server;
  var http = require("http");
  var logPrefix = "===========EZH WS-SERVER: "
  var clients = [];
  var pzhadaptor = require("../pzhadaptor.js")

  function wsServer(port, ezhHelpers) {
    this.wsPort = port;
    this.ezhHelpers = ezhHelpers;
  }

  wsServer.prototype.start = function() {
    var that = this;
    var httpServer = http.createServer(function(req,res) {
      // Do nothing => this is required for upgrading the websocket server
    });

    var wsServer = new websocketServer({ httpServer: httpServer });

    wsServer.on("request", function (request) {
      console.log(logPrefix + new Date() + " ws connection request from origin " + request.origin);

      var connection = request.accept(null, request.origin);
      var clientId = clients.push(connection) - 1;

      var sendReply = function (msg, result) {
        connection.sendUTF(JSON.stringify({id: msg.id, result: result.message }));
      };

      connection.on("message", function(message) {
        if (message.type === "utf8") {
          console.log(logPrefix + " received message from client " + clientId + " : " + message.utf8Data);
          var msg = JSON.parse(message.utf8Data);
          switch (msg.message.method) {
            case "getZones":
              pzhadaptor.getZones(msg.user,function(result){
                sendReply(msg,result);
              });
              break;
            case "getConnectedZones":
              pzhadaptor.getConnectedZones(msg.user, msg.message.params["targetPZH"],function(result) {
                sendReply(msg,result);
              });
              break;
            case "getActiveServices":
              pzhadaptor.getActiveServices(msg.user, msg.message.params["targetPZH"], function(result) {
                var zones = {};
                that.ezhHelpers.rationaliseServices(zones,result.message);
                sendReply(msg,{ message: zones });
              });
              break;
          }
        }
      });

      connection.on("close", function(connection) {
        if (clientId > 0) {
          console.log(logPrefix + " client closed " + clientId);
          clients.splice(clientId,1);
        }
      });
    });

    httpServer.listen(that.wsPort, function() {
      console.log(logPrefix + " socket service is listening on port " + that.wsPort);
    });
  };

  wsServer.prototype.broadcast = function(data) {
    for (var conn in clients) {
      try {
        clients[conn].sendUTF(JSON.stringify({type: "update", data: data}));
      } catch(e) {
        console.log(logPrefix + " error sending to client: " + conn);
      }
    }
  };

  module.exports = wsServer;
}())