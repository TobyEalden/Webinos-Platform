module.exports = function (app, address, port, ezhHelpers) {    "use strict";
  var pzhInfoCache = {};

  function renderPZHHome(id, pzhId, req, res) {
    ezhHelpers.pzhadaptor.getPZHPZPs(req.user, pzhId, function(pzp_result) {
      ezhHelpers.pzhadaptor.getConnectedZones(req.user, pzhId, function(pzh_result) {
        ezhHelpers.pzhadaptor.getPendingFriends(req.user, pzhId, function(pending_result) {
          var pzhName = (pzhId in pzhInfoCache) ? pzhInfoCache[pzhId].username : pzhId;
          res.render('mobile/pzh', { id:id, ui: ezhHelpers.getUIOptions(req), title: "Zone Details", pzhName: pzhName, pzh: pzhId, pzpList: pzp_result.message, pzhList: pzh_result.message, requestList: pending_result.message });
        });
      });
    });
  }

  function displayEndpoint(addr) {
    var details = ezhHelpers.splitAddress(addr);
    return details.pzhHost + "/" + details.email + (details.pzp.length > 0 ? ("/" + details.pzp) : "");
  }

  app.get('/m', ezhHelpers.ensureAuthenticated, function (req, res) {
    if (req.session.isPzp) {
          ezhHelpers.pzhadaptor.fromWeb(req.user, {payload:{status:"enrollPzpAuthCode", address:address, port:port, pzpPort:req.session.pzpPort, user:ezhHelpers.getUserPath(req.user), pzpHost:req.session.pzpHost}}, res);
          req.session.isPzp = "";
          req.session.pzpPort = "";
          req.session.pzpHost = "";
      } else {
        if (!ezhHelpers.isPrivileged(req.user)) {
            renderPZHHome("home", ezhHelpers.getCurrentPZH(req.user), req,res);
        } else {
          ezhHelpers.pzhadaptor.getZones(req.user, function(result) {
            pzhInfoCache = result.message;
            res.render('mobile/ezh', { id:"home", ui: ezhHelpers.getUIOptions(req), title: "UbiApps", pzhList: result.message });
          });
        }
      }
  });

  app.get('/m/pzh/:pzhId', ezhHelpers.ensureAuthenticated, function(req, res) {
    renderPZHHome("pzh",ezhHelpers.getPZHId(req),req,res);
  });

  /*
    PZP
   */
  app.get('/m/pzp/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    res.render('mobile/pzp', { id:"pzp", ui: ezhHelpers.getUIOptions(req), title: "Device", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId});
  });

  app.get('/m/installed/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.render('mobile/installed', { id:"installed", ui: ezhHelpers.getUIOptions(req), title: "Apps", widgetList: result.message.installedList, pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
    });
  });

  app.get('/m/about/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
      ezhHelpers.pzhadaptor.getPZHDetails(req.user, ezhHelpers.getPZHId(req), function(result) {
        res.render('mobile/about', { id:"about", ui: ezhHelpers.getUIOptions(req), title: "About Zone", about: result.message, pzh: ezhHelpers.getPZHId(req) });
      });
  });

  app.get('/m/invite/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
    ezhHelpers.pzhadaptor.getZones(req.user, function(result) {
      res.render('mobile/invite', { id:"invite", ui: ezhHelpers.getUIOptions(req), title: "Invite a Friend", pzh: ezhHelpers.getPZHId(req), pzhList: result.message });
    });
  });

  app.get('/m/approve/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
    ezhHelpers.pzhadaptor.getPendingFriends(req.user, ezhHelpers.getPZHId(req), function(lst) {
      res.render('mobile/approve', { id:"approve", ui: ezhHelpers.getUIOptions(req), title: "Approve friend", pzh: ezhHelpers.getPZHId(req), requestList: lst.message });
    });
  });

  app.get('/m/install-app/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req,res) {
      res.render('mobile/install-app', { id:"installApp", ui: ezhHelpers.getUIOptions(req), title: "Install App", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
  });

  // Get app details
  app.get('/m/app/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      var installId = req.params.appId;
      if (result.message.installedList.hasOwnProperty(installId)) {
        res.render('mobile/app', { id:"app", ui: ezhHelpers.getUIOptions(req), title: "App", app: result.message.installedList[installId], pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
      } else {
        res.render('problem',{ id:"problem", ui: ezhHelpers.getUIOptions(req), title: "Problem", error: "App " + installId + " not found on device."});
      }
    });
  });

  // Wipe succeeded
  app.get('/m/wiped/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    res.render('mobile/success', { ui: ezhHelpers.getUIOptions(req), title: "Device Wiped", pzh: ezhHelpers.getPZHId(req), message: "Successfully wiped device " + req.params.pzpId});
  });

  app.get('/m/services/:pzhId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(result) {
      var zones = {};
      ezhHelpers.rationaliseServices(zones,result.message);
      res.render('mobile/services-active', { id:"getActiveServices", ui: ezhHelpers.getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), zones: zones });
    });
  });

  app.get('/m/services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(activeResult) {
        var zones = {};
        ezhHelpers.rationaliseServices(zones,activeResult.message, ezhHelpers.getPZHId(req), req.params.pzpId);
        res.render('mobile/services-active', { id:"getActiveServices", ui: ezhHelpers.getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, zones: zones});
      });
  });

/*
  app.get('/m/services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(activeResult) {
      ezhHelpers.pzhadaptor.getDefaultServices(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(defaultResult) {
        var zones = {};
        ezhHelpers.rationaliseServices(zones,activeResult.message, ezhHelpers.getPZHId(req), req.params.pzpId);
        res.render('mobile/services', { id:"getActiveServices", ui: ezhHelpers.getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, zones: zones, defaultServices: defaultResult.message.modules });
      });
    });
  });
*/

  app.get('/m/default-services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getDefaultServices(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.render('mobile/services-default', { id:"getDefaultServices", ui: ezhHelpers.getUIOptions(req), title: "Default Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, services: result.message.modules });
    });
  });

  app.get('/m/removeService/:pzhId/:pzpId/:serviceAddress/:serviceId/:serviceAPI', ezhHelpers.ensureAuthenticated, function(req,res) {
    res.render('mobile/success', { ui: ezhHelpers.getUIOptions(req), title: "Service Removed", pzh: ezhHelpers.getPZHId(req), message: "Successfully removed service " + req.params.serviceAPI});
  });

  app.post('/removeService/:pzhId/:pzpId/:serviceAddress/:serviceId/:serviceAPI', ezhHelpers.ensureAuthenticated, function(req,res){
    ezhHelpers.pzhadaptor.removeActiveService(req.user, ezhHelpers.getPZHId(req), req.params.serviceAddress, req.params.serviceId, req.params.serviceAPI, function(result) {
      res.redirect('/removeService/' + req.params.pzhId + '/' + req.params.pzpId + '/' + encodeURIComponent(req.params.serviceAddress) + '/' + req.params.serviceId + '/' + encodeURIComponent(req.params.serviceAPI));
    });
  });

  app.get('/m/nyi', function(req,res) {
    res.render('mobile/nyi',{ id:"nyi", ui: ezhHelpers.getUIOptions(req), title: "Not Implemented"});
  });

  app.get('/m/login', function (req, res) {
    res.render('mobile/login', { user:req.user, id:"login", ui: ezhHelpers.getUIOptions(req), title: "UbiApps Login", isPZP: req.session.isPzp });
  });
};
