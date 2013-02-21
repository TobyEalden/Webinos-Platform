if (typeof ubi === "undefined") {
  ubi = {};
}

ubi.dataCache = function() {
  var socket;
  var listeners = {};
  var zones;

  var createMessage = function(method,params) {
    return {
      method: method,
      params: params
    };
  };

  var emit = function (evt,data) {
    if (evt in listeners) {
      for (var cb in listeners[evt]) {
        listeners[evt][cb](data);
      }
    }
  };

  var _loadZones = function() {
    var msg = createMessage("getZones");
    socket.send(msg, function (result) {
      zones = result;
      for (var z in zones) {
        emit("zone",z);
      }
    });

  };

  var _loadZone = function(zoneId) {
    var msg = createMessage("getActiveServices", {targetPZH: zoneId});
    socket.send(msg, function (result) {
      emit("zoneDetails",{zoneId: zoneId, zoneData: result});
    });
  };

  var _initialise = function(user, cb){
    socket = new ubi.ClientSocket(user);
    socket.connect(3000,function() {
      cb();
    });
  };

  var _on = function(evt,cb) {
    if (typeof cb === "function") {
      if (!(evt in listeners)) {
        listeners[evt] = [];
      }

      listeners[evt].push(cb);
    } else {
      ubi.console.log("Invalid callback for event " + evt,ubi.console.error);
    }
  };

  return {
    initialise: _initialise,
    loadZones: _loadZones,
    loadZone: _loadZone,
    on: _on
  };
}();