$(function() {
  ubi.console.log("Initialising navigator");

  function toggleNode(n) {
    $(n).siblings("ul").each(function() { $(this).toggle(); });
    $(n).html($(n).html() === "+" ? "-" : "+");
  }

  $(".tree-branch").children("ul").each(function() { $(this).hide(); });
  $(".tree-expander").click(function() {
    toggleNode(this);
    return false;
  });

  $(".tree-expander").next("a").dblclick(function() {
    toggleNode($(this).prev("a"));
    return false;
  });

  $(".zone-tree-item").click(function() {
    var pzhId = this.id.substr(1);
    ubi.console.log("Loading details for zone " + pzhId);
    $.ajax({
      url: "/d/pzh/about/" + pzhId
    }).done(function(data){
        ubi.console.log("Got details for zone " + pzhId);
        $("#centre").html(data);
      }).fail(function(xhr,status,err){
        ubi.console.log("Failed to load details for zone " + pzhId + ": " + status + " " + (err || ""), ubi.console.error);
      });
  });

  $(".apps-folder-item").click(function() {
    var that = this;
    var toks = this.id.split('|');
    if (toks.length !== 3) {
      ubi.console.log("Loading apps - invalid identifier: " + this.id);
    } else {
      var listItem = $(that).next("ul");
      listItem.empty();
      listItem.append("<li class=\"tree-node tree-leaf\">Loading...</li>")
      var pzh = toks[1];
      var pzp = toks[2];
      ubi.console.log("Loading apps for zone " + pzh + " and device " + pzp);
      ubi.apps.loadDeviceApps(pzh,pzp,function(ok,data) {
        listItem.empty();
        if (ok) {
          var list = JSON.parse(data);
          for (var i in list) {
            ubi.console.log("Got app " + list[i].name.visual);
            listItem.append("<li class=\"tree-node tree-leaf\"><a class='app-tree-item' href='#'>" + list[i].name.visual + "</a></li>");
          }
        } else {
          ubi.console.log("Failed to get apps",ubi.console.error);
          $("<li>" + data + "</li>").appendTo(listItem);
        }
      });
    }
  });
});
