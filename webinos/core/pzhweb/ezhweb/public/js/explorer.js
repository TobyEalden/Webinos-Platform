if (typeof ubi === "undefined") {
  ubi = {};
}

ubi.explorer = function() {
  var treeRoot;
  var dataCache;

  /*
  $(".tree-expander").next("a").dblclick(function() {
    toggleNode($(this).prev("a"));
    return false;
  });
  */

  function sanitiseId(id) {
    return id.replace(/\./g,'!');
  }
  function isExpanded(n) {
    return $(n).html() === "-";
  }

  function toggleNode(n) {
    $(n).siblings("ul").each(function() { $(this).toggle(); });
    $(n).html($(n).html() === "+" ? "-" : "+");
  }

  function parseId(id) {
    var result = {};

    var toks = id.split('|');
    result.paramCount = toks.length;
    if (toks.length > 0) {
      result.actionType = toks[0];
    }
    if (toks.length > 1) {
      result.pzh = toks[1];
    }
    if (toks.length > 2) {
      result.pzp = toks[2];
    }
    if (toks.length > 3) {
      result.extra = toks[3];
    }

    return result;
  }

  function setInset(url) {
    $(".ui-layout-center").html("");
    $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='" + url + "'></iframe>");
  }

  $(document).on("click",".zone-tree-item", function(){
    var params = parseId(this.id);
    if (params.paramCount !== 2 || params.actionType !== "zone") {
      ubi.console.log("Loading zone details - invalid identifier: " + this.id);
    } else {
      setInset("/d/pzh/about/" + params.pzh);
    }
  });

  $(document).on("click",".devices-tree-item", function(){
    var params = parseId(this.id);
    if (params.paramCount !== 2 || params.actionType !== "devices") {
      ubi.console.log("Loading zone device details - invalid identifier: " + this.id);
    } else {
      setInset("/d/pzh/pzps/" + params.pzh);
    }
  });

  $(document).on("click",".device-tree-item", function(){
    var params = parseId(this.id);
    if (params.paramCount !== 2 || params.actionType !== "device") {
      ubi.console.log("Loading device details - invalid identifier: " + this.id);
    } else {
      setInset("/d/pzp/" + params.pzh + "/" + params.pzp);
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

  $(document).on("click",".tree-expander", function() {
    toggleNode(this);
    return false;
  });

  $(document).on("click",".zone-tree-item-expander",function() {
    if ($(this).siblings("ul").children().length === 0) {
      addLeaf($(this).parent(),"none-tree-leaf","","Loading...");
      dataCache.loadZone($(this).next().get(0).id.split("|")[1]);
    }
  });

  function deleteBranch(parent) {
    parent.children("ul").empty();
  }

  function addBranch(parent,branchClass,branchId,branchName) {
    var branchTempl = "<li class='tree-node tree-branch'>" +
        "<a class='tree-expander " + branchClass + "-expander' href='#'>+</a>" +
        "<a class='folder-tree-item " + branchClass + "' id='" + branchId + "' href='#'>" + branchName +"</a>" +
        "<ul></ul>" +
        "</li>";

    parent.children("ul").append(branchTempl).show();
  }

  function addLeaf(parent,leafClass,leafId,leafName) {
    var leafTempl = "<li class='tree-node tree-leaf'>" +
                      "<a id='" + leafId + "' class='" + leafClass + "' href='#'>" + leafName + "</a>" +
                    "</li>";

    parent.children("ul").append(leafTempl).show();
  }

  var _initialise = function(root,dCache) {
    treeRoot = root;
    dataCache = dCache;

    var rootTempl = "<li class='tree-branch'>" +
      "<a class='tree-expander' href='#'>-</a>" +
      "<a class='folder-tree-item zones-tree-item' href='#'>Zones</a>" +
      "<ul></ul>";

    treeRoot.empty();
    treeRoot.append(rootTempl);

    dataCache.on("zone", function(zone) {
      addBranch(treeRoot.children("li"),"zone-tree-item","zone|" + zone,zone);
    });

    dataCache.on("zoneDetails", function(zoneDetails) {
      var zoneLink = treeRoot.find("a[id='zone|" + zoneDetails.zoneId + "']");
      deleteBranch(zoneLink.parent());
      addBranch(zoneLink.parent(),"services-tree-item","services|" + zoneDetails.zoneId, "Services");
      var servicesLink = treeRoot.find("a[id='services|" + zoneDetails.zoneId + "']");
      addBranch(zoneLink.parent(),"devices-tree-item","devices|" + zoneDetails.zoneId, "Devices");
      var devicesLink = treeRoot.find("a[id='devices|" + zoneDetails.zoneId + "']");
      addBranch(zoneLink.parent(),"friends-tree-item","friends|" + zoneDetails.zoneId, "Friends");
      var friendsLink = treeRoot.find("a[id='friends|" + zoneDetails.zoneId + "']");
      for (var pzhId in zoneDetails.zoneData) {
        var pzh = zoneDetails.zoneData[pzhId];
        if (pzhId === zoneDetails.zoneId) {
          for (var pzpId in pzh.pzps) {
            addLeaf(devicesLink.parent(),"device-tree-item","device|" + pzpId, pzpId);
          }
          for (var s in pzh.services) {
            var svc = pzh.services[s];
            addLeaf(servicesLink.parent(),"service-tree-item","service|" + svc.id,svc.displayName);
          }
        } else {
          // This is a connected PZH
          addLeaf(friendsLink.parent(),"friend-tree-item","friend|" + pzhId, pzhId);
        }
      }
    });
  };

  return {
    initialise: _initialise
  };
}();
