if (typeof ubiapps === "undefined") {
  ubiapps = {};
}

ubi.services = function() {

  ubi.console.log("Initialising services handler");

  function _findServices(api, callback) {

    function serviceFoundCB(service) {
      ubi.console.log("Found service at " + service.serviceAddress);
      callback(service);
    }

    function serviceLostCB(service) {
      ubi.console.log("service lost: " + service.id, ubi.console.error);
    }

    function error(discoveryError) {
      ubi.console.log("Discovery error: " + discoveryError.message + " (Code: #" + discoveryError.code + ")",ubi.console.error);
    }

    webinos.discovery.findServices( {api:api}, {onFound:serviceFoundCB, onLost:serviceLostCB, onError:error}, null, null);
  }

  return {
    findServices: _findServices
  };
}();