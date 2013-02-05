$(function() {
  ubi.console.log("Initialising navigator");

  function toggleNode(n) {
    $(n).siblings("ul").each(function() { $(this).toggle(); });
    $(n).html($(n).html() === "+" ? "-" : "+");
  }

  $(".tree-branch").children("ul").each(function() {
    // Hide branches
    $(this).hide();
    // Then show them again (to align the expanders).
    toggleNode(this);
  });

  $(".tree-expander").click(function() {
    toggleNode(this);
    return false;
  });

  $(".tree-expander").next("a").dblclick(function() {
    toggleNode($(this).prev("a"));
    return false;
  });

  $(".apps-folder-item").click(function() {
    var that = this;
    var toks = this.id.split('|');
    if (toks.length !== 3 || toks[0] !== "apps") {
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
          var list = data.installedList;
          if ($.isEmptyObject(list)) {
            $("<li class=\"tree-node tree-leaf\">No apps installed</li>").appendTo(listItem);
          } else {
            for (var i in list) {
              ubi.console.log("Got app " + list[i].name.visual);
              listItem.append("<li class=\"tree-node tree-leaf\"><a id='app|" + pzh + "|" + pzp + "|" + list[i].installId + "' class='app-tree-item' href='#'>" + list[i].name.visual + "</a></li>");
            }
          }
        } else {
          ubi.console.log("Failed to get apps",ubi.console.error);
          $("<li class=\"tree-node tree-leaf\">" + data + "</li>").appendTo(listItem);
        }
        $(".ui-layout-center").html("");
        $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/installed/" + pzh + "/" + pzp + "'></iframe>");
      });
    }
  });

  $(document).on("click",".zone-tree-item", function(){
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 2 || toks[0] !== "zone") {
      ubi.console.log("Loading zone details - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/pzh/about/" + pzh + "'></iframe>");
    }
  });

  $(document).on("click",".devices-tree-item", function(){
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 2 || toks[0] !== "devices") {
      ubi.console.log("Loading zone device details - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/pzh/pzps/" + pzh + "'></iframe>");
    }
  });

  $(document).on("click",".device-tree-item", function(){
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 3 || toks[0] !== "device") {
      ubi.console.log("Loading device details - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      var pzp = toks[2];
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/pzp/" + pzh + "/" + pzp + "'></iframe>");
    }
  });

  $(document).on("click",".services-tree-item", function() {
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 2 || toks[0] !== "services") {
      ubi.console.log("Loading services - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/services/" + pzh + "'></iframe>");
    }
  });

  $(document).on("click",".device-services-tree-item", function() {
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 3 || toks[0] !== "services") {
      ubi.console.log("Loading services - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      var pzp = toks[2];
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/services/" + pzh + "/" + pzp + "'></iframe>");
    }
  });

  $(document).on("click",".friends-tree-item", function() {
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 2 || toks[0] !== "friends") {
      ubi.console.log("Loading friends - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/friends/" + pzh + "'></iframe>");
    }
  });

  $(document).on("click",".zones-tree-item", function() {
    $(".ui-layout-center").html("");
    $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/zones'></iframe>");
  });

  $(document).on("click",".app-tree-item", function() {
    var that = this;
    var toks = this.id.split("|");
    if (toks.length !== 4 || toks[0] !== "app") {
      ubi.console.log("Loading app details - invalid identifier: " + this.id);
    } else {
      var pzh = toks[1];
      var pzp = toks[2];
      var installId = toks[3];
      ubi.console.log("Loading app details for zone " + pzh + " and device " + pzp + " and app " + installId);
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='/d/app/" + pzh + "/" + pzp + "/" + installId + "'></iframe>");
    }
  });
});
