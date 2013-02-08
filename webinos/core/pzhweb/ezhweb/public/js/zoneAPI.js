if (typeof ubi === "undefined") {
  ubi = {};
}

ubi.zoneAPI = function () {

  var skt;

  var createMessage = function(method,params) {
    return {
      method: method,
      params: params
    };
  };

  var _initialise = function (user,callback) {
    skt = new ubi.ClientSocket(user);
    skt.connect(3000,callback);
  };

  var _getZones = function (cb) {
    var msg = createMessage("getZones");
    skt.send(msg, function(result) {
       cb(result);
    });
  };

  var _getConnectedZones = function (targetPZH,success, failure) {
    var msg = createMessage("getConnectedZones",{targetPZH: targetPZH});
    skt.send(msg, function (result) {
      ubi.console.log("Received reply from getConnectedZones: " + result);
      success(result);
    });
  };

  return {
    initialise: _initialise,
    getZones: _getZones,
    getConnectedZones: _getConnectedZones
  };
}();