module.exports = function (app, address, port, ezhHelpers) {
  "use strict";
  var dependency = require("find-dependencies")(__dirname);
  var logger = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console;
  var pzhadaptor = require('../../pzhadaptor.js');
  var passport = require('passport');
  var helper = require('../../routes/helper.js');
  var pzhInfoCache = {};

  app.get('/d', ezhHelpers.ensureAuthenticated, function (req, res) {
    if (req.session.isPzp) {
          pzhadaptor.fromWeb(req.user, {payload:{status:"enrollPzpAuthCode", address:address, port:port, pzpPort:req.session.pzpPort, user:ezhHelpers.getUserPath(req.user)}}, res);
          req.session.isPzp = "";
          req.session.pzpPort = "";
    } else {
      if (!ezhHelpers.isPrivileged(req.user)) {
          renderPZHHome("home", ezHelpers.getCurrentPZH(req.user), req,res);
      } else {
        pzhadaptor.getFarmPZHs(req.user, function(result) {
          pzhInfoCache = result.message;
          res.render('desktop/ezh', { id:"home", title: "UbiApps", pzhList: result.message });
        });
      }
    }
  });

  app.get('/d/login', function (req, res) {
    if (req.query.isPzp) {
      req.session.isPzp = true;
      req.session.pzpPort = req.query.port;
    }
    res.render('desktop/login', { user:req.user, id:"login", title: "UbiApps Login", isPZP: req.session.isPzp });
  });
};
