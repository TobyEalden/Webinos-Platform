if (typeof ubi === "undefined") {
  ubi = {};
}

ubi.explorer = function() {
  var treeRoot;
  var dataCache;

  function isExpanded(n) {
    return $(n).html() === "-";
  }

  function toggleNode(n) {
    var sub = $(n).siblings("ul:eq(0)");
    var visible = sub.is(":visible");
    sub.toggle();
    $(n).html(visible ? "+" : "-");
  }

  function setInset(url) {
    var centre = $(".ui-layout-center");
    var firstChild = centre.children(":first");
    if (firstChild && firstChild.prop("tagName") !== "IFRAME") {
      $(".ui-layout-center").html("");
      $(".ui-layout-center").append("<iframe style='' scrolling='auto' width='100%' height='100%' frameborder='0' src='" + url + "'></iframe>");
    } else {
      firstChild.attr("src",url);
    }
  }

  $(document).on("click",".tree-expander", function() {
    toggleNode(this);
    return false;
  });

  $(document).on("click",".zone-tree-item-expander",function() {
    if ($(this).siblings("ul").children().length === 0) {
      addLeaf($(this).parent(),"none-tree-leaf","","Loading...");
      dataCache.loadZone($(this).next().get(0).id.split("|")[1]);
    }
    return false;
  });

  $(document).on("click", ".folder-tree-item,.leaf-tree-item", function() {
    if (this.href !== window.location.href + "#") {
      setInset(this.href);
    }
    return false;
  });

  function deleteBranch(parent) {
    parent.children("ul").empty();
  }

  function addBranch(parent,branchClass,branchId,branchName,href) {
    var branchTempl = "<li class='tree-node tree-branch'>" +
        "<a class='tree-expander " + branchClass + "-expander' href='#'>+</a>" +
        "<a class='folder-tree-item " + branchClass + "' id='" + branchId + "' href='" + (href || "#") + "'>" + branchName +"</a>" +
        "<ul></ul>" +
        "</li>";

    parent.children("ul").append(branchTempl).hide();
  }

  function addLeaf(parent,leafClass,leafId,leafName,href) {
    var leafTempl = "<li class='tree-node tree-leaf'>" +
                      "<a id='" + leafId + "' class='leaf-tree-item " + leafClass + "' href='" + (href || "#") + "'>" + leafName + "</a>" +
                    "</li>";

    parent.children("ul").append(leafTempl).hide();
  }

  var _initialise = function(root,dCache) {
    treeRoot = root;
    dataCache = dCache;

    var rootTempl = "<li class='tree-branch'>" +
      "<a class='tree-expander' href='#'>-</a>" +
      "<a id='root' class='folder-tree-item zones-tree-item' href='/d/zones'>Zones</a>" +
      "<ul></ul>";

    treeRoot.empty();
    treeRoot.append(rootTempl);

    dataCache.on("zone", function(zone) {
      addBranch(treeRoot.children("li"),"zone-tree-item","zone|" + zone,zone,"/d/pzh/about/" + zone);
      toggleNode($("#root").prev());
    });

    dataCache.on("zoneDetails", function(zoneDetails) {
      var zoneLink = treeRoot.find("a[id='zone|" + zoneDetails.zoneId + "']");
      deleteBranch(zoneLink.parent());
      addBranch(zoneLink.parent(),"services-tree-item","services|" + zoneDetails.zoneId, "Services", "/d/services/" + zoneDetails.zoneId);
      var servicesLink = treeRoot.find("a[id='services|" + zoneDetails.zoneId + "']");
      addBranch(zoneLink.parent(),"devices-tree-item","devices|" + zoneDetails.zoneId, "Devices", "/d/pzh/pzps/" + zoneDetails.zoneId);
      var devicesLink = treeRoot.find("a[id='devices|" + zoneDetails.zoneId + "']");
      addBranch(zoneLink.parent(),"friends-tree-item","friends|" + zoneDetails.zoneId, "Friends", "/d/friends/" + zoneDetails.zoneId);
      var friendsLink = treeRoot.find("a[id='friends|" + zoneDetails.zoneId + "']");
      for (var pzhId in zoneDetails.zoneData) {
        var pzh = zoneDetails.zoneData[pzhId];
        if (pzhId === zoneDetails.zoneId) {
          for (var pzpId in pzh.pzps) {
            var pzp = pzh.pzps[pzpId];
            addBranch(devicesLink.parent(),"device-tree-item","device|" + pzpId, pzpId, "/d/pzp/" + zoneDetails.zoneId + "/" + pzpId);
            var deviceLink = treeRoot.find("a[id='device|" + pzpId + "']");
            addLeaf(deviceLink.parent(),"app-tree-item","apps|" + pzpId,"Apps","/d/installed/" + zoneDetails.zoneId + "/" + pzpId);
            addBranch(deviceLink.parent(),"device-services-tree-item","services|" + pzpId,"Services","/d/services/" + zoneDetails.zoneId + "/" + pzpId);
            var deviceServicesLink = treeRoot.find("a[id='services|" + pzpId + "']");
            for (var s in pzp.services) {
              var svc = pzp.services[s];
              addLeaf(deviceServicesLink.parent(),"service-tree-item","service|" + svc.id,svc.displayName);
            }
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
      toggleNode(zoneLink.prev());
    });
  };

  return {
    initialise: _initialise
  };
}();
