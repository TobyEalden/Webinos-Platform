$(function() {
  ubi.console.log("Initialising menus");

  $("#menu-map-devices").click(function() {
    ubi.console.log("Loading device map");
    $.ajax({
      url: "/map/"
    }).done(function(data){
        $(".ui-layout-center").html("");
        $(".ui-layout-center").append(data);
      }).fail(function(xhr,status,err){
        ubi.console.log("Failed to load device map: " + status + " " + (err || ""), ubi.console.error);
      });

    return false;
  });

  $("#menu-iot-dashboard").click(function() {
    ubi.console.log("Loading iot dashboard");
    var url = "http://" + window.location.hostname + ":8080/apps/app-sem/index.html";
    $(".ui-layout-center").html("");
    $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='" + url + "'></iframe>");

    return false;
  });
});