(function() {
  var _parent;
  var callbackMap = {};
  
  function remoteManager(parent) {
    _parent = parent;
  }

  function getInstalledWidgets(msg) {
    _parent.pzh_state.logger.log ("receiving installed widgets from pzp...");
    if (!msg.payload.message.id) {
        _parent.pzh_state.logger.error ("cannot find callback");
        return;
    }
    callbackMap[msg.payload.message.id] (msg.payload.message);
    delete callbackMap[msg.payload.message.id];
  }

  remoteManager.prototype.processMsg = function(msg) {
    var processed = true;
    switch (msg.payload.status) {
      case "getInstalledWidgetsReply":
          getInstalledWidgets(msg);
          break;
      default:
        processed = false;
        break;
    }
    
    return processed;
  };

  remoteManager.prototype.addMsgCallback = function (callback) {
      var id = (parseInt ((1 + Math.random ()) * 0x10000)).toString (16).substr (1);
      callbackMap[id] = callback;
      return id;
  };
  
  module.exports = remoteManager;
}());