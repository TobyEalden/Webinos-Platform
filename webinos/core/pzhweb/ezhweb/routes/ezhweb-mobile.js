module.exports = function (app, address, port, ezhHelpers) {    "use strict";
  var dependency = require("find-dependencies")(__dirname);
  var logger = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console;
  var pzhInfoCache = {};

  function getUIOptions(req) {
    return {
      appTitle: "UbiApps Enterprise Zone",
      appURL: "http://ubiapps.com",
      mainTheme: "d",
      optionTheme: "b",
      infoTheme: "c",
      dividerTheme: "d",
      collapsibleTheme: "d",
      privileged: ezhHelpers.isPrivileged(req.user),
      serverName: req.user ? ezhHelpers.getCurrentPZH(req.user) : "",
      contentOnly: req.param("insert","") !== ""
    };
  }

  function renderPZHHome(id, pzhId, req, res) {
    ezhHelpers.pzhadaptor.getPZHPZPs(req.user, pzhId, function(pzp_result) {
      ezhHelpers.pzhadaptor.getPZHPZHs(req.user, pzhId, function(pzh_result) {
        ezhHelpers.pzhadaptor.getPendingFriends(req.user, pzhId, function(pending_result) {
          var pzhName = (pzhId in pzhInfoCache) ? pzhInfoCache[pzhId].username : pzhId;
          res.render('mobile/pzh', { id:id, ui: getUIOptions(req), title: "Zone Details", pzhName: pzhName, pzh: pzhId, pzpList: pzp_result.message, pzhList: pzh_result.message, requestList: pending_result.message });
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
          ezhHelpers.pzhadaptor.getFarmPZHs(req.user, function(result) {
            pzhInfoCache = result.message;
            res.render('mobile/ezh', { id:"home", ui: getUIOptions(req), title: "UbiApps", pzhList: result.message });
          });
        }
      }
  });

  app.get('/m/pzh/:pzhId', ezhHelpers.ensureAuthenticated, function(req, res) {
    renderPZHHome("pzh",ezhHelpers.getPZHId(req),req,res);
  });

  app.get('/m/friends/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res){
    var pzhId = ezhHelpers.getPZHId(req);
    ezhHelpers.pzhadaptor.getPZHPZHs(req.user, pzhId, function(pzh_result) {
      ezhHelpers.pzhadaptor.getPendingFriends(req.user, pzhId, function(pending_result) {
        var pzhName = (pzhId in pzhInfoCache) ? pzhInfoCache[pzhId].username : pzhId;
        res.render('mobile/friends', { id:"friends", ui: getUIOptions(req), title: "Zone Details", pzhName: pzhName, pzh: pzhId, pzhList: pzh_result.message, requestList: pending_result.message });
      });
    });
  });

  app.get('/m/pzp/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    res.render('mobile/pzp', { layout: "mobile/content-only", id:"pzp", ui: getUIOptions(req), title: "Device", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId});
  });

  app.get('/m/installed/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.render('mobile/installed', { id:"installed", ui: getUIOptions(req), title: "Apps", widgetList: result.message.installedList, pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
    });
  });

  app.get('/m/about/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
      ezhHelpers.pzhadaptor.getPZHDetails(req.user, ezhHelpers.getPZHId(req), function(result) {
        res.render('mobile/about', { id:"about", ui: getUIOptions(req), title: "About Zone", about: result.message, pzh: ezhHelpers.getPZHId(req) });
      });
  });

  app.get('/m/invite/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
    ezhHelpers.pzhadaptor.getFarmPZHs(req.user, function(result) {
      res.render('mobile/invite', { id:"invite", ui: getUIOptions(req), title: "Invite a Friend", pzh: ezhHelpers.getPZHId(req), pzhList: result.message });
    });
  });

  app.get('/m/approve/:pzhId', ezhHelpers.ensureAuthenticated, function(req,res) {
    ezhHelpers.pzhadaptor.getPendingFriends(req.user, ezhHelpers.getPZHId(req), function(lst) {
      res.render('mobile/approve', { id:"approve", ui: getUIOptions(req), title: "Approve friend", pzh: ezhHelpers.getPZHId(req), requestList: lst.message });
    });
  });

  app.get('/m/install-app/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req,res) {
      res.render('mobile/install-app', { id:"installApp", ui: getUIOptions(req), title: "Install App", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
  });

  app.get('/m/do-install/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req,res) {
      var installUrl = "http://webinos.two268.com/apps/wgl-demo.wgt/wgl-demo.wgt";
      ezhHelpers.pzhadaptor.installWidget(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, installUrl, function(result) {
        res.render('mobile/install-app-result', { id:"installAppResult", ui: getUIOptions(req), title: "Install App Result", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, result: result.message });
      });
  });

  app.get('/m/do-install-url/:pzhId/:pzpId/:appUrl', ezhHelpers.ensureAuthenticated, function(req,res) {
      ezhHelpers.pzhadaptor.installWidget(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, req.params.appUrl, function(result) {
        res.render('mobile/install-app-result', { id:"installAppResult", ui: getUIOptions(req), title: "Install App Result", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, result: result.message });
      });
  });

  app.get('/m/app/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      var installId = req.params.appId;
      if (result.message.installedList.hasOwnProperty(installId)) {
        res.render('mobile/app', { id:"app", ui: getUIOptions(req), title: "App", app: result.message.installedList[installId], pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
      } else {
        res.render('problem',{ id:"problem", ui: getUIOptions(req), title: "Problem", error: "App " + installId + " not found on device."});
      }
    });
  });

  app.get('/m/remove-app/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.removeWidget(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, req.params.appId, function(result) {
      res.redirect('/installed/' + ezhHelpers.getPZHId(req) + "/" + req.params.pzpId);
    });
  });

  app.get('/m/wipe/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    res.render('mobile/success', { ui: getUIOptions(req), title: "Device Wiped", pzh: ezhHelpers.getPZHId(req), message: "Successfully wiped device " + req.params.pzpId});
  });

  app.post('/m/wipe/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.wipe(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.redirect('/m/wipe/' + req.params.pzhId + '/' + req.params.pzpId);
    });
  });

  app.get('/m/services/:pzhId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(result) {
      var entities = ezhHelpers.rationaliseServices(result.message);
      res.render('mobile/services-active', { id:"getActiveServices", ui: getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), entities: entities });
    });
  });

  app.get('/m/services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(activeResult) {
        var entities = ezhHelpers.rationaliseServices(activeResult.message, ezhHelpers.getPZHId(req), req.params.pzpId);
        res.render('mobile/services-active', { id:"getActiveServices", ui: getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, entities: entities});
      });
  });

/*
  app.get('/m/services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getPZHId(req), function(activeResult) {
      ezhHelpers.pzhadaptor.getDefaultServices(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(defaultResult) {
        var entities = ezhHelpers.rationaliseServices(activeResult.message, ezhHelpers.getPZHId(req), req.params.pzpId);
        res.render('mobile/services', { id:"getActiveServices", ui: getUIOptions(req), title: "Active Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, entities: entities, defaultServices: defaultResult.message.modules });
      });
    });
  });
*/

  app.get('/m/default-services/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.getDefaultServices(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.render('mobile/services-default', { id:"getDefaultServices", ui: getUIOptions(req), title: "Default Services", pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId, services: result.message.modules });
    });
  });

  app.get('/m/removeService/:pzhId/:pzpId/:serviceAddress/:serviceId/:serviceAPI', ezhHelpers.ensureAuthenticated, function(req,res) {
    res.render('mobile/success', { ui: getUIOptions(req), title: "Service Removed", pzh: ezhHelpers.getPZHId(req), message: "Successfully removed service " + req.params.serviceAPI});
  });

  app.post('/removeService/:pzhId/:pzpId/:serviceAddress/:serviceId/:serviceAPI', ezhHelpers.ensureAuthenticated, function(req,res){
    ezhHelpers.pzhadaptor.removeActiveService(req.user, ezhHelpers.getPZHId(req), req.params.serviceAddress, req.params.serviceId, req.params.serviceAPI, function(result) {
      res.redirect('/removeService/' + req.params.pzhId + '/' + req.params.pzpId + '/' + encodeURIComponent(req.params.serviceAddress) + '/' + req.params.serviceId + '/' + encodeURIComponent(req.params.serviceAPI));
    });
  });

  app.get('/m/nyi', function(req,res) {
    res.render('mobile/nyi',{ id:"nyi", ui: getUIOptions(req), title: "Not Implemented"});
  });

  app.get('/m/approveFriend/:pzhId/:email', ezhHelpers.ensureAuthenticated, function (req, res) {
    ezhHelpers.pzhadaptor.approvePZHFriend(req.user, ezhHelpers.getPZHId(req), req.params.email, function() {
      res.redirect('/m/pzh/' + ezhHelpers.getPZHId(req));
    });
  });

  app.get('/m/rejectFriend/:pzhId/:email', ezhHelpers.ensureAuthenticated, function (req, res) {
    ezhHelpers.pzhadaptor.rejectPZHFriend(req.user, ezhHelpers.getPZHId(req), req.params.email,function() {
      res.redirect('/m/pzh/' + ezhHelpers.getPZHId(req));
    });
  });

  app.get('/m/removeFriend/:pzhId/:email/:externalPZH', ezhHelpers.ensureAuthenticated, function (req, res) {
    ezhHelpers.pzhadaptor.removePZHFriend(req.user, ezhHelpers.getPZHId(req), req.params.email, req.params.externalPZH, function() {
      res.redirect('/m/pzh/' + ezhHelpers.getPZHId(req));
    });
  });

  app.get('/m/login', function (req, res) {
    res.render('mobile/login', { user:req.user, id:"login", ui: getUIOptions(req), title: "UbiApps Login", isPZP: req.session.isPzp });
  });
};
