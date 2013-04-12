// Load the google api loader
if (typeof(google) === 'undefined' || !google.load ) {
  $.getScript( '//www.google.com/jsapi', function() {
    loadMaps();
  });
}
else {
  // otherwise just load maps
  loadMaps();
}

// load the google maps api
function loadMaps() {
  google.load("maps", "3", {
    callback: initMap,
    other_params: 'sensor=true'
  });
}

function initMap() {
  var mapOptions = { center: new google.maps.LatLng(51.672555,-0.087891),zoom: 8,mapTypeId: google.maps.MapTypeId.ROADMAP};
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  var geoServices = {};
  var boundServices = {};
  var markers = {};

  function gotLocation(service,position) {
    ubi.console.log("Got location for: " + service.serviceAddress);
    var lookup = position.coords.latitude + "," + position.coords.longitude;
    if (!(lookup in markers)) {
      var marker = new google.maps.Marker({position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude), map: map });
      markers[lookup] = {marker: marker, services: [service]};
      var infowindow = new google.maps.InfoWindow();

      ubi.console.log("Adding click listener for " + service.serviceAddress);
      google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          ubi.console.log("Click on marker for: " + service.serviceAddress);
          var devices = "";
          for (var s in markers[lookup].services) {
            devices = devices + "<span style=\"color:black;font-size:.9em;\">" + markers[lookup].services[s].serviceAddress + "</span><br />";
          }
          infowindow.setContent(devices);
          infowindow.open(map, marker);
        }
      })(marker));
      ubi.console.log("Added click listener for " + service.serviceAddress);
    } else {
      markers[lookup].services.push(service);
    }
  }

  function geoLocationError(error) {
    switch(error.code)
    {
      case error.PERMISSION_DENIED:
        ubi.console.log("user did not share geolocation data",ubi.console.error);
        break;
      case error.POSITION_UNAVAILABLE:
        ubi.console.log("could not detect current position",ubi.console.error);
        break;
      case error.TIMEOUT:
        ubi.console.log("retrieving position timed out",ubi.console.error);
        break;
      default:
        ubi.console.log("unknown error code = " + error.code + "; message = " + error.message,ubi.console.error);
        break;
    }
  }

  function serviceBound(service) {
    ubi.console.log("Successfully bound to service: " + service.serviceAddress);
    boundServices[service.serviceAddress] = service;

    var PositionOptions = {};
    PositionOptions.enableHighAccuracy = true;
    PositionOptions.maximumAge = 5000;
    PositionOptions.timeout = 1000;

    ubi.console.log("Calling getCurrentPosition on " + service.serviceAddress);
    service.getCurrentPosition(function(loc) { gotLocation(service,loc); }, geoLocationError, PositionOptions);
  }

  function bindService(serviceAddress) {
    if ((serviceAddress in geoServices) && !(serviceAddress in boundServices)) {
      ubi.console.log("Binding to service: " + serviceAddress);
      geoServices[serviceAddress].bindService({ onBind:serviceBound });
    } else {
      ubi.console.log("Service alread bound: " + serviceAddress);
    }
  }

  function geoServiceFound(service) {
    if (!(service.serviceAddress in geoServices)) {
      ubi.console.log("Found service: " + service.serviceAddress);
      geoServices[service.serviceAddress] = service;
      bindService(service.serviceAddress);
    }
  }

  ubi.services.findServices("http://webinos.org/api/w3c/geolocation", geoServiceFound);
}