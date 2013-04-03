var _services = {};
var _service;

$(document).ready(start);
$(document).on("click","#serviceList a", function() { bindService(this.innerText); });

function start() {
   var _id = 0;
	
	function serviceFoundCB(service) {
     service._lookup = _id++;
		_services[service.serviceAddress] = service;
		var serviceDiv = $("<div>");
		serviceDiv.attr("id", "div-" + service._lookup);
		var serviceAnchor = $("<a>");
		serviceAnchor.attr("id",service._lookup);
		serviceAnchor.attr("href","#");
		serviceAnchor.text(service.serviceAddress);
		serviceDiv.append(serviceAnchor);
		var serviceAnswer = $("<span>");
		serviceAnswer.attr("id","ans-" + service._lookup);
		serviceDiv.append(serviceAnswer);
		$(serviceList).append(serviceDiv.clone());
  }
	
	function serviceLostCB(service) {
		_services[service.serviceAddress] = null;
	}
	
	function error(discoveryError) {
		alert("Discovery error: " + discoveryError.message + " (Code: #" + discoveryError.code + ")");
	}

	webinos.discovery.findServices(
			{api:"http://webinos.org/api/test"},
			{onFound:serviceFoundCB, onLost:serviceLostCB, onError:error}, 
        null, 
        null
   );
}

function bindService(serviceId) {
	if (_services[serviceId]) {
		_service = _services[serviceId];
		_service.bindService({ onBind:serviceBound });
	}
}

function serviceBound(service) {
	$("#ans-" + service._lookup).text("waiting for response...");
	_service.get42("",function(ans) { $("#ans-" + service._lookup).text("replied with " + ans); }, function(err) { $("#ans-" + service._lookup).text("error - " + err); });
}
