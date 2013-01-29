(function() {
  var _parent;
  var http = require('http');
  var url = require('url');
  var fs = require('fs');
  var path = require('path');  
  var webinos = require("find-dependencies")(__dirname);
  var pzp = webinos.global.require(webinos.global.pzp.location, "lib/pzp");
  var signedOnly = false;
  var widgetLibrary; 
  try { widgetLibrary = require('../../manager/widget_manager/index.js'); } catch(e) { widgetLibrary = null; console.log("failed to load widget manager"); }
  
  function remoteManager(parent) {
    _parent = parent;
  }

  function getInstalledWidgets(receivedMsg) {
    console.log("getInstalledWidgets was invoked");
    var installedList = {};
    
    if (widgetLibrary) {
      var idList = widgetLibrary.widgetmanager.getInstalledWidgets();
      for (var installId in idList) {
        var cfg = widgetLibrary.widgetmanager.getWidgetConfig(idList[installId]);
        installedList[idList[installId]] = cfg;
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
  
  function downloadFile(fileURL, callback) {
    console.log('Downloading file: ' + fileURL);

    var host = url.parse(fileURL).hostname;
    var port = url.parse(fileURL).port;
    var pathname = url.parse(fileURL).path;
    var filename = url.parse(fileURL).pathname.split('/').pop()

    var options = {
      host: host,
      port: port,
      path: pathname,
    };

    // Create and execute request for the file.
    var clientReq = http.get(options, function (clientResponse) {
        // Download to temporary folder.
        var targetFilePath = path.join(pzp.session.getWebinosPath(), '../widgetDownloads');

        try {
          // Create the target path if it doesn't already exist.
          fs.statSync(targetFilePath);
        }  catch (e) {
          fs.mkdirSync(targetFilePath)
        }

        targetFilePath = targetFilePath + "/" + filename;
        var downloadfile = fs.createWriteStream(targetFilePath, {'flags': 'w'});
        downloadfile.on('close',function() { callback(true, targetFilePath); });

        clientResponse.setEncoding('binary');
        clientResponse.addListener('data', function (chunk) {
          downloadfile.write(chunk, encoding='binary');
        });

        clientResponse.addListener('end', function() {
          downloadfile.end();
          console.log('Finished downloading ' + fileURL);                
        });
    });

    clientReq.on('error', function (e) {
      console.log('problem with request: ' + e.message);
      callback(false);
    });        
  }

  function doInstallWidget(wgtPath, callback) {
      console.log("installing " + wgtPath);

      // Callback for widget manager
      function handlePendingInstall(processingResult) {
        var installId = processingResult.getInstallId();

        if (processingResult.status) {
          // An error occurred.
          console.log('wm: pendingInstall error: install: ' + processingResult.status);
          if (installId) {
            widgetLibrary.widgetmanager.abortInstall(installId);
          }
          callback({ title: "widget installation", status: processingResult.status, text: processingResult.error.getReasonText() });
        } else {
          // Pending install OK => complete the install.
          if (signedOnly && processingResult.validationResult.status != widgetLibrary.WidgetConfig.STATUS_VALID) {
            console.log("failing installation of unsigned widget");
            callback({ title: "widget installation", status: processingResult.validationResult.status, text: "widget not signed - installation failed"});        
          } else {
            console.log("******** completing install: " + installId);
            
            var result = widgetLibrary.widgetmanager.completeInstall(installId, true);
            if (result) {
              console.log('wm: completeInstall error: install: ' + result);
              callback({ title: "widget installation", status: result, text: "completing installation failed"});
            } else {
              console.log('wm: install complete');
              callback(null, installId);
           }
         }
       }
     }

     widgetLibrary.widgetmanager.prepareInstall(wgtPath, {}, handlePendingInstall);
   }

  function installWidget(receivedMsg) {
    console.log("installWidget was invoked with " + receivedMsg.installUrl);
    
    downloadFile(receivedMsg.installUrl, function(ok, filePath) {
      if (ok) {
        doInstallWidget(filePath,function(err, installId) {
          _parent.prepMsg (
            _parent.pzp_state.sessionId,
            _parent.config.metaData.pzhId,
            "installWidgetReply", {
                "ok" : err === null,
                "installId": installId,
                "err" : err,
                "id"      :receivedMsg.listenerId
            });    
        });
      } else {
        _parent.prepMsg (
          _parent.pzp_state.sessionId,
          _parent.config.metaData.pzhId,
          "installWidgetReply", {
              "ok"      : false,
              "reason"  : "Download failed.",
              "id"      :receivedMsg.listenerId
          });    
      }
    });
    
  }
  
  remoteManager.prototype.processMsg = function(msg) {
    var processed = true;
    switch (msg.payload.status) {
      case "getInstalledWidgets":
        getInstalledWidgets(msg.payload.message);
        break;
      case "installWidget":
        installWidget(msg.payload.message);
        break;
      default:
        processed = false;
        break;
    }
    
    return processed;
  };

  module.exports = remoteManager;
}());