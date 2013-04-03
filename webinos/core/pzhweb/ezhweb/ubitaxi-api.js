module.exports = function(jobs) {
  var websocketServer = require("websocket").server;
  var http = require("http");
  var logPrefix = "===========UBITAXI WS-SERVER: "
  var clients = [];

  function ubiTaxiWebSocketServer(port) {
    this.wsPort = port;
  }

  ubiTaxiWebSocketServer.prototype.start = function() {
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
          var packet = JSON.parse(message.utf8Data);
          switch (packet.message.method) {
            case "pendingJobs":
              var unallocatedJobList = jobs.getJobs(jobs.STATUS_ORDER_TAKEN, jobs.STATUS_ORDER_TAKEN);
              sendReply(packet, { message: unallocatedJobList });
              break;
            case "allocatedJobs":
              var driverId = packet.message.driverId;
              var allocatedJobList = jobs.getJobs(jobs.STATUS_DRIVER_ALLOCATED, jobs.STATUS_DRIVER_ALLOCATED,driverId);
              sendReply(packet, { message: allocatedJobList });
              break;
            case "allocateJob":
              var driverId = packet.message.driverId;
              var jobId = parseInt(packet.message.jobId);
              var time = parseInt(packet.message.time);
              var lat = parseFloat(packet.message.lat);
              var lng = parseFloat(packet.message.lng);
              var allocatedJob = jobs.allocateDriver(jobId, driverId, time, lat, lng);
              sendReply(packet, { message: allocatedJob });
              break;
            case "currentJob":
              var driverId = packet.message.driverId;
              var currentJob = jobs.getCurrentJob(driverId);
              if (currentJob == null) {
                currentJob = jobs.getNextJob(driverId);
              }
              sendReply(packet, { message: currentJob });
              break;
            case "updateJobProgress":
              var jobId = parseInt(packet.message.jobId);
              var status = packet.message.status;
              var time = parseInt(packet.message.time);
              var lat = parseFloat(packet.message.lat);
              var lng = parseFloat(packet.message.lng);
              var updated = jobs.updateJobProgress(jobId,status,time,lat,lng);
              sendReply(packet, { message: updated })
              break;
            default:
              console.log(logPrefix + " unknown method " + packet.message.method);
              break;
          }
        } else {
          console.log(logPrefix + " unknown message type " + message.type);
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

  ubiTaxiWebSocketServer.prototype.broadcast = function(data) {
    for (var conn in clients) {
      try {
        clients[conn].sendUTF(JSON.stringify({type: "update", data: data}));
      } catch(e) {
        console.log(logPrefix + " error sending to client: " + conn);
      }
    }
  };

  return {
    webSocketServer: ubiTaxiWebSocketServer
  };
}