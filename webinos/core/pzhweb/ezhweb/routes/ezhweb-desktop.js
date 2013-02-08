module.exports = function (app, address, port, ezhHelpers) {
  "use strict";
  var pzhInfoCache = {};

  /*
  Landing page
   */
  app.get('/d', ezhHelpers.ensureAuthenticated, function (req, res) {
    var zones = {};
    function processPZH(farms_result,index) {
      ezhHelpers.pzhadaptor.getActiveServices(req.user, Object.keys(farms_result)[index], function(services_result) {
        ezhHelpers.rationaliseServices(zones,services_result.message);
        if (index < Object.keys(farms_result).length) {
          process.nextTick(function() {processPZH(farms_result,index+1); });
        } else {
          res.render('desktop/ezh', { user: req.user.emails[0].value, pzh: ezhHelpers.getPZHId(req), zones: zones });
        }
      });
    }

    if (req.session.isPzp) {
          ezhHelpers.pzhadaptor.fromWeb(req.user, {payload:{status:"enrollPzpAuthCode", address:address, port:port, pzpPort:req.session.pzpPort, user:ezhHelpers.getUserPath(req.user), pzpHost:req.session.pzpHost}}, res);
          req.session.isPzp = "";
          req.session.pzpPort = "";
          req.session.pzpHost = "";
    } else {
      if (!ezhHelpers.isPrivileged(req.user)) {
        ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getCurrentPZH(req.user), function(services_result) {
          ezhHelpers.rationaliseServices(zones,services_result.message);
          res.render('desktop/ezh', { pzh: ezhHelpers.getPZHId(req), zones: zones });
        });
      } else {
        ezhHelpers.pzhadaptor.getZones(req.user, function(farms_result) {
          processPZH(farms_result.message,0);
        });
      }
    }
  });

  app.get('/d/zones', ezhHelpers.ensureAuthenticated,function(req,res){
    ezhHelpers.pzhadaptor.getZones(req.user, function(result) {
      pzhInfoCache = result.message;
      res.render('desktop/inset/zones', { id:"home", ui: ezhHelpers.getUIOptions(req), title: "UbiApps", pzhList: result.message });
    });
  });

  /*
   PZH
   */

  // Get zone details
  app.get('/d/pzh/about/:pzhId',ezhHelpers.ensureAuthenticated,function(req,res){
    ezhHelpers.pzhadaptor.getPZHDetails(req.user, ezhHelpers.getPZHId(req), function(result) {
      res.render('desktop/inset/about-zone', { id:"about", about: result.message, pzh: ezhHelpers.getPZHId(req) });
    });
  });

  // Also display zone details for main PZH page (rather than list of options as on the mobile site).
  app.get('/d/pzh/:pzhId',ezhHelpers.ensureAuthenticated,function(req,res){
    ezhHelpers.pzhadaptor.getPZHDetails(req.user, ezhHelpers.getPZHId(req), function(result) {
      res.render('desktop/inset/about-zone', { id:"about", about: result.message, pzh: ezhHelpers.getPZHId(req) });
    });
  });

  // Get zone devices
  app.get('/d/pzh/pzps/:pzhId',ezhHelpers.ensureAuthenticated,function(req,res) {
    ezhHelpers.pzhadaptor.getPZHPZPs(req.user, ezhHelpers.getPZHId(req), function(result) {
      res.render('desktop/inset/zone-devices', { ui: ezhHelpers.getUIOptions(req), title: "Devices", pzpList: result.message});
    });
  });

  /*
    PZP
   */

  // PZP options
  app.get('/d/pzp/:pzhId/:pzpId',ezhHelpers.ensureAuthenticated, function(req,res) {
    res.render('desktop/inset/pzp', { id:"pzp", ui: ezhHelpers.getUIOptions(req), title: "Device", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId});
  });

  // Show installed widgets
  app.get('/d/installed/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.render('desktop/inset/installed', { id:"installed", ui: ezhHelpers.getUIOptions(req), title: "Apps", widgetList: result.message.installedList, pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
    });
  });

  // Install selection page
  app.get('/d/install-app/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req,res) {
    res.render('desktop/inset/install-app', { id:"installApp", ui: ezhHelpers.getUIOptions(req), title: "Install App", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
  });

  // Get app details
  app.get('/d/app/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      var installId = req.params.appId;
      if (result.message.installedList.hasOwnProperty(installId)) {
        res.render('desktop/inset/about-app', { id:"app", ui: ezhHelpers.getUIOptions(req), title: "App", app: result.message.installedList[installId], pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
      } else {
        res.render('desktop/inset/problem',{ id:"problem", ui: ezhHelpers.getUIOptions(req), title: "Problem", error: "App " + installId + " deleted."});
      }
    });
  });

  // Wipe succeeded
  app.get('/d/wiped/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    res.render('desktop/inset/success', { ui: ezhHelpers.getUIOptions(req), title: "Device Wiped", pzh: ezhHelpers.getPZHId(req), message: "Successfully wiped device " + req.params.pzpId});
  });

  /*
  Services
   */
  app.get('/d/services/:pzhId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(result) {
      var zones = {};
      ezhHelpers.rationaliseServices(zones,result.message);
      res.render('desktop/inset/services-active', { id:"getActiveServices", ui: ezhHelpers.getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), zones: zones });
    });
  });

  app.get('/d/services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(activeResult) {
      var zones = {};
      ezhHelpers.rationaliseServices(zones,activeResult.message, ezhHelpers.getPZHId(req), req.params.pzpId);
      res.render('desktop/inset/services-active', { id:"getActiveServices", ui: ezhHelpers.getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, zones: zones});
    });
  });

  /*
  Friends
   */
  app.get('/d/friends/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res){
    var pzhId = ezhHelpers.getPZHId(req);
    ezhHelpers.pzhadaptor.getConnectedZones(req.user, pzhId, function(pzh_result) {
      ezhHelpers.pzhadaptor.getPendingFriends(req.user, pzhId, function(pending_result) {
        var pzhName = (pzhId in pzhInfoCache) ? pzhInfoCache[pzhId].username : pzhId;
        res.render('desktop/inset/zone-friends', { id:"friends", ui: ezhHelpers.getUIOptions(req), title: "Zone Details", pzhName: pzhName, pzh: pzhId, pzhList: pzh_result.message, requestList: pending_result.message });
      });
    });
  });

  app.get('/d/invite/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
    ezhHelpers.pzhadaptor.getZones(req.user, function(result) {
      res.render('desktop/inset/invite', { id:"invite", ui: ezhHelpers.getUIOptions(req), title: "Invite a Friend", pzh: ezhHelpers.getPZHId(req), pzhList: result.message });
    });
  });

  /*
  Menu options
   */
  app.get('/d/map', ezhHelpers.ensureAuthenticated, function(req,res) {
    res.render("desktop/partials/device-map");
  });

  /*
  Authorisation
   */
  app.get('/d/login', function (req, res) {
    if (req.query.isPzp) {
      req.session.isPzp = true;
      req.session.pzpPort = req.query.port;
      req.session.pzpHost = req.query.host;
    }
    res.render('desktop/login', { user:req.user, id:"login", title: "UbiApps Login", isPZP: req.session.isPzp });
  });
};
