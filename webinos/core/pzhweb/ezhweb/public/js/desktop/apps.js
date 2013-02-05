if (typeof ubiapps === "undefined") {
  ubiapps = {};
}

ubi.apps = function() {

  ubi.console.log("Initialising applications handler");

  var _loadDeviceApps = function(pzh,pzp,cb) {
    ubi.console.log("Loading device apps for " + pzh + "/" + pzp);
    $.post("/ajax/get-installed-apps/" + pzh + "/" + pzp).done(function(data){
        cb(true,data);
      }).fail(function(xhr,status,err){
        ubi.console.log("Failed to load device apps: " + status + " " + (err || ""), ubi.console.error);
        cb(false,err || "Load failed");
      });
  };

  var _loadDeviceApp = function(pzh,pzp,installId,cb) {
    ubi.console.log("Loading device app " + pzh + "/" + pzp + "/" + installId);
    $.ajax({
      url: "/d/installed-app/" + pzh + "/" + pzp + "/" + installId
    }).done(function(data){
        $(".ui-layout-center").html("");
        $(".ui-layout-center").append(data);
        cb(true,data);
      }).fail(function(xhr,status,err){
        ubi.console.log("Failed to load device app: " + status + " " + (err || ""), ubi.console.error);
        cb(false,err || "Load failed");
      });
  }

  return {
    loadDeviceApps: _loadDeviceApps,
    loadDeviceApp: _loadDeviceApp
  };
}();
