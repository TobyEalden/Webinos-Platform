(function() {
  var _parent;
  
  function remoteManager(parent) {
    _parent = parent;
  }

  function getInstalledWidgets(receivedMsg) {
    console.log("getInstalledWidgets was invoked");
    var widgetLibrary; 
    try { widgetLibrary = require('../../manager/widget_manager/index.js'); } catch(e) { widgetLibrary = null; console.log("failed to load widget manager"); }
    var installedList = [];
    
    if (widgetLibrary) {
      var idList = widgetLibrary.widgetmanager.getInstalledWidgets();
      for (var installId in idList) {
        var cfg = widgetLibrary.widgetmanager.getWidgetConfig(idList[installId]);
        installedList.push(cfg);
      }
    }
    
    _parent.prepMsg (
      _parent.pzp_state.sessionId,
      _parent.config.metaData.pzhId,
      "getInstalledWidgetsReply", {
          "installedList": installedList,
          "id"      :receivedMsg.listenerId
      });
  }
  
  remoteManager.prototype.processMsg = function(msg) {
    var processed = true;
    switch (msg.payload.status) {
      case "getInstalledWidgets":
          getInstalledWidgets(msg.payload.message);
          break;
      default:
        processed = false;
        break;
    }
    
    return processed;
  };

  module.exports = remoteManager;
}());