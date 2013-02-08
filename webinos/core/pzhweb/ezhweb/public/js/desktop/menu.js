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
});