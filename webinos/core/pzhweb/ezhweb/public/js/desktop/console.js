if (typeof ubi === "undefined") {
  ubi = {};
}

ubi.console = function(){
  var _levels = {
    info: "info",
    warn: "warn",
    error: "error",
    browser: "browser"
  };

  var _pad = function(num,sig) {
    var s = sig ? -sig : -2;
    return ("00" + num.toString()).slice(s);
  };

  var _log = function(msg,level) {
    // Determine css class.
    var css = "log-severity-" + ((level in _levels) ? level : "info");
    // Format timestamp
    var tsDate = new Date();
    var ts = tsDate.toLocaleDateString() + " " + _pad(tsDate.getHours()) + ":" + _pad(tsDate.getMinutes()) + ":" + _pad(tsDate.getSeconds()) + "." + _pad(tsDate.getMilliseconds(),3);
    $("<div class=\"logEntry " + css + "\"><span>" + ts + "></span> " + msg + "</div>").appendTo("#console");

    // Scroll to end.
    var south = $(".ui-layout-south");
    if (south.length > 0){
      south.scrollTop(south[0].scrollHeight);
    }
  };

  var consoleLog = console.log;
  console.log = function(msg) { _log("[browser] " + msg,_levels.browser); consoleLog.call(console,msg); };

  var consoleError = console.error;
  console.error = function(msg) { _log("[browser] " + msg,_levels.error); consoleError.call(console,msg); };

  return {
    info: _levels.info,
    warn: _levels.warn,
    error: _levels.error,
    log: _log
  }
}();
