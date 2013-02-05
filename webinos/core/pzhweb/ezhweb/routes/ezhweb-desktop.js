module.exports = function (app, address, port, ezhHelpers) {
  "use strict";
  var dependency = require("find-dependencies")(__dirname);
  var logger = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console;
  var pzhInfoCache = {};

  app.get('/d', ezhHelpers.ensureAuthenticated, function (req, res) {
    if (req.session.isPzp) {
          pzhadaptor.fromWeb(req.user, {payload:{status:"enrollPzpAuthCode", address:address, port:port, pzpPort:req.session.pzpPort, user:ezhHelpers.getUserPath(req.user)}}, res);
          req.session.isPzp = "";
          req.session.pzpPort = "";
    } else {
      if (!ezhHelpers.isPrivileged(req.user)) {
          renderPZHHome("home", ezhHelpers.getCurrentPZH(req.user), req,res);
      } else {
        ezhHelpers.pzhadaptor.getActiveServices(req.user, ezhHelpers.getCurrentPZH(req.user), function(result) {
          var entities = ezhHelpers.rationaliseServices(result.message);
          res.render('desktop/ezh', { pzh: ezhHelpers.getPZHId(req), entities: entities });
        });
      }
    }
  });

  /*
  Apps
   */
  app.get('/d/installed-apps/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req,res){
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.json(JSON.stringify(result.message.installedList));
      //res.render('desktop/partials/installed-apps', { widgetList: result.message.installedList, pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
    });
  });

  app.get('/d/installed-app/:pzhId/:pzpId/:installId', ezhHelpers.ensureAuthenticated, function(req,res){
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      var installId = req.params.installId;
      if (result.message.installedList.hasOwnProperty(installId)) {
        //res.json(JSON.stringify(result.message.installedList[installId]));
        res.render('desktop/partials/about-app', { app: result.message.installedList[installId], pzh: ezhHelpers.getPZHId(req), pzp: req.params.pzpId });
      } else {
        res.render('problem',{ title: "Problem", error: "App " + installId + " not found on device."});
      }
    });
  });

  app.get('/d/pzh/about/:pzhId',ezhHelpers.ensureAuthenticated,function(req,res){
    ezhHelpers.pzhadaptor.getPZHDetails(req.user, ezhHelpers.getPZHId(req), function(result) {
      res.render('desktop/partials/about-pzh', { id:"about", about: result.message, pzh: ezhHelpers.getPZHId(req) });
    });
  });

  app.get('/d/map', ezhHelpers.ensureAuthenticated, function(req,res) {
    res.render("desktop/partials/device-map");
  });

  app.get('/d/login', function (req, res) {
    if (req.query.isPzp) {
      req.session.isPzp = true;
      req.session.pzpPort = req.query.port;
      req.session.pzpHost = req.query.host;
    }
    res.render('desktop/login', { user:req.user, id:"login", title: "UbiApps Login", isPZP: req.session.isPzp });
  });
};
