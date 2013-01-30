(function() {
  var _parent;
  var callbackMap = {};
  
  function remoteManager(parent) {
    _parent = parent;
  }

  function forwardMsg(msg) {
    if (!msg.payload.message.id) {
        _parent.pzh_state.logger.error ("cannot find callback");
        return false;
    }
    callbackMap[msg.payload.message.id] (msg.payload.message);
    delete callbackMap[msg.payload.message.id];
    
    return true;
  }

  remoteManager.prototype.processMsg = function(msg) {
    _parent.pzh_state.logger.log ("received " + msg.payload.status + " from pzp...");
    return forwardMsg(msg);
  };

  remoteManager.prototype.addMsgCallback = function (callback) {
      var id = (parseInt ((1 + Math.random ()) * 0x10000)).toString (16).substr (1);
      callbackMap[id] = callback;
      return id;
  };
  
  module.exports = remoteManager;
}());