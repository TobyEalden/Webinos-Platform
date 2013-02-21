module.exports = function (app, address, port, state) {
  "use strict";

  var passport = require('passport');
  var helper = require('../../routes/helper.js');
  var pzhadaptor = require('../../pzhadaptor.js');

  var ezhHelpers = function() {
    var getUserPath = function(user) {
      return encodeURIComponent(user.emails[0].value);
    };

    var isMobile = function (req) {
      var ua = req.header('user-agent');
      return (/mobile/i.test(ua)) ? true : false;
    };

    var getCurrentPZH = function (user) {
      return address + "_" + user.emails[0].value;
    };

    var isPrivileged = function (user) {
      var privilegedUsers = {
        "nick@nquiringminds.com": true,
        "toby.ealden@gmail.com": true,
        "ezh.ubiapps@gmail.com": true
      };

      var email = user ? (user.emails ? user.emails[0].value : user) : "";
      return user ? (email in privilegedUsers) : false;
    };

    var ensureAuthenticated = function (req, res, next) {
      if (req.isAuthenticated()) {
        if ("pzhId" in req.params && req.params.pzhId != getCurrentPZH(req.user) && !isPrivileged(req.user)) {
          // Request is for a different PZH from currently logged on (non-privileged) user.
          if (isMobile(req)) {
            res.redirect("/m");
          } else {
            res.redirect("/");
          }
        } else {
          return next();
        }
      } else {
          res.redirect('/login');
      }
    };

    var getPZHId = function(req) {
      if (isPrivileged(req.user)) {
        return req.params.pzhId;
      } else {
        return getCurrentPZH(req.user);
      }
    };

    var splitAddress = function(addr) {
      var pzhSep = addr.indexOf('_');

      var pzhHost = '';
      var pzp;
      var email = '';

      if (pzhSep >= 0) {
        pzhHost = addr.substr(0,pzhSep);
        email = addr.substr(pzhSep+1);
        var pzpSep = email.indexOf('/');
        if (pzpSep >= 0) {
          pzp = email.substr(pzpSep+1);
          email = email.substr(0,pzpSep);
        }
      }

      return { pzhHost: pzhHost, pzh: pzhHost + "_" + email, pzp: pzp, email: email };
    };

    var rationaliseServices = function(zones, payload, pzhId, pzpId) {
      for (var serv in payload.services){
        var s = payload.services[serv];
        var address = splitAddress(s.serviceAddress);
        if (!pzhId || address.pzh === pzhId) {
          if (!zones.hasOwnProperty(address.pzh)) {
            zones[address.pzh] = { services: {}, pzps: {} };
          }
          if (address.pzp && (!pzpId || address.pzp === pzpId)) {
            if (!zones[address.pzh].pzps.hasOwnProperty(address.pzp)) {
              zones[address.pzh].pzps[address.pzp] = { services: {} };
            }
            zones[address.pzh].pzps[address.pzp].services[s.id] = s;
          } else if (!pzpId) {
            zones[address.pzh].services[s.id] = s;
          }
        }
      }

      return zones;
    }

    var getUIOptions = function(req) {
      return {
        appTitle: "UbiApps Enterprise Zone",
        appURL: "http://ubiapps.com",
        mainTheme: "d",
        optionTheme: "b",
        infoTheme: "c",
        dividerTheme: "d",
        collapsibleTheme: "d",
        privileged: isPrivileged(req.user),
        user: req.user ? req.user.emails[0].value : "",
        serverName: req.user ? getCurrentPZH(req.user) : ""
      };
    }

    return {
      isMobile: isMobile,
      ensureAuthenticated: ensureAuthenticated,
      isPrivileged: isPrivileged,
      getCurrentPZH: getCurrentPZH,
      getUserPath: getUserPath,
      getPZHId: getPZHId,
      pzhadaptor: pzhadaptor,
      splitAddress: splitAddress,
      rationaliseServices: rationaliseServices,
      getUIOptions: getUIOptions
    }
  }();

  var WSServer= require('../wsServer.js');
  var webSocket = new WSServer(3000, ezhHelpers);
  webSocket.start();

  var mobileRoutes = require('./ezhweb-mobile');
  mobileRoutes(app, address, port, ezhHelpers);
  var desktopRoutes = require('./ezhweb-desktop');
  desktopRoutes(app, address, port, ezhHelpers);

  app.get('/', ezhHelpers.ensureAuthenticated, function(req,res) {
    if (ezhHelpers.isMobile(req)) {
      res.redirect('/m');
    } else {
      res.redirect('/');
    }
  });

  app.get('/login', function(req,res) {
    if (req.query.isPzp) {
      req.session.isPzp = true;
      req.session.pzpPort = req.query.port;
      req.session.pzpHost = req.query.host;
    }
    if (ezhHelpers.isMobile(req)) {
      res.redirect('/m/login');
    } else {
      res.redirect('/m/login');
    }
  });

  app.get('/auth/google', passport.authenticate('google', { failureRedirect:'/login' }),
    function (req, res) {
      res.redirect('/');
    }
  );

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/yahoo',
    passport.authenticate('yahoo'),
    function (req, res) {
      // The request will be redirected to Yahoo for authentication, so
      // this function will not be called.
    }
  );

  app.get('/auth/google/return',
    passport.authenticate('google', { failureRedirect:'/' }),
    function (req, res) {
      if (ezhHelpers.isMobile(req)) {
        res.redirect('/m');
      } else {
        res.redirect('/');
      }
    }
  );
  app.get('/auth/yahoo/return',
    passport.authenticate('yahoo', { failureRedirect:'/' }),
    function (req, res) {
      if (ezhHelpers.isMobile(req)) {
        res.redirect('/m');
      } else {
        res.redirect('/');
      }
    }
  );

  app.get('/main/:user/', ezhHelpers.ensureAuthenticated, function (req, res) {
    if (ezhHelpers.isMobile(req)) {
      res.redirect('/m/pzh/' + address + "_" + req.params.user);
    } else {
      res.redirect('/pzh/' + address + "_" + req.params.user);
    }
  });

  // present certificates to an external party.
  app.all('/main/:useremail/certificates/', function (req, res) {
    //return a JSON object containing all the certificates.
    pzhadaptor.fromWebUnauth(req.params.useremail, {type:"getCertificates"}, res);
  });

  app.post('/main/:user/pzpEnroll', ezhHelpers.ensureAuthenticated, function (req, res) {
    var dataSend = {
      payload:{
        status:"csrAuthCodeByPzp",
        from:req.body.from,
        csr:req.body.csr,
        code:req.body.authCode
      }
    };
    pzhadaptor.fromWeb(req.user, dataSend, res);
  });

  //Certificate exchange...
  app.get('/connect-friend/:pzhId/:connectPzhId', ezhHelpers.ensureAuthenticated, function (req, res) {
    //Args: The external user's email address and PZH provider
    //Auth: User must have logged into their PZH
    //UI: NONE
    //Actions: adds the friend's details to the list of 'waiting for approval', redirects the user to the external PZH
    var splitIdx = req.params.connectPzhId.indexOf('_');
    var externalEmail = req.params.connectPzhId.substr(splitIdx+1);
    var externalPZH = req.params.connectPzhId.substr(0,splitIdx);;
    logger.log("External: " + externalEmail + " - " + externalPZH);
    if (req.params.pzhId === req.params.connectPzhId) {
      logger.log('Cannot register own PZH ' + externalEmail);
      res.render("problem",{ id:"problem", ui: getUIOptions(req.user), title: "Problem", error: "You cannot make friends with yourself."});
    } else {
      //get those certificates
      //"https://" + externalPZH + "/main/" + encodeURIComponent(externalEmail) + "/certificates/"
      helper.getCertsFromHost(externalEmail, externalPZH, function (certs) {
        pzhadaptor.addTrustedFriend(req.user, ezhHelpers.getPZHId(req),externalEmail, externalPZH, certs.message, function (status) {
          if (status.message) {//get my details from somewhere
            splitIdx = req.params.pzhId.indexOf('_');
            var myCertEmail = req.params.pzhId.substr(splitIdx+1);
            var myCertificateUrl = "https://" + address + ":" + port + "/main/" + myCertEmail + "/certificates/";
            var myPzhUrl = "https://" + address + ":" + port + "/main/" + myCertEmail + "/";
            //where are we sending people
            var redirectUrl = "https://" + externalPZH + "/main/" + encodeURIComponent(externalEmail) +
              "/request-access-login?certUrl=" + encodeURIComponent(myCertificateUrl) +
              "&pzhInfo=" + encodeURIComponent(myPzhUrl) + "&ownEmailId=" + myCertEmail;
            console.log("_-----------------_ redirecting to: " + redirectUrl);
            res.redirect(redirectUrl);
          } else {
            logger.log('Certificate already exchanged');
            res.render("problem",{ id:"problem", title: "Problem", error: "This person is already your friend, or there is a pending friend request.<br /><br />Certificate already exchanged."});
          }
        });
      }, function (err) {
        logger.log('Failed to retrieve certificate from remote host');
        res.render("problem",{ id:"problem", title: "Problem", error: "Failed to retrieve certificate from remote host."});
      });
    }

    // technically this is a problem.
    // someone could change the URI in transit to transfer different certificates
    // this would make Bob think that Alice was from a different personal zone.
    // TODO: Work out some way of putting the 'get' data into the body, despite this being a redirect.

  });

  /*
  Ajax
   */
  app.post('/ajax/get-installed-apps/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req,res){
    ezhHelpers.pzhadaptor.getInstalledWidgets(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.json(result.message);
    });
  });

  // Install app (from known app id)
  app.post('/ajax/do-install/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req,res) {
    var installUrl;
    switch (req.params.appId) {
      case "wglDemo":
        installUrl = "http://webinos.two268.com/apps/wgl-demo.wgt/wgl-demo.wgt";
        break
      case "html5Test":
        installUrl = "http://webinos.two268.com/apps/html5test.wgt";
        break
      case "airhockey":
        installUrl = "http://webinos.two268.com/apps/airhockey.wgt";
        break
      case "webcommander":
        installUrl = "http://webinos.two268.com/apps/webcommander.wgt";
        break
      case "pzpadmin":
        installUrl = "http://webinos.two268.com/apps/pzpadmin.wgt";
        break
    }
    ezhHelpers.pzhadaptor.installWidget(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, installUrl, function(result) {
      res.json(result.message);
    });
  });

  // Install app (arbitrary app url)
  app.post('/ajax/do-install-url/:pzhId/:pzpId/:appUrl', ezhHelpers.ensureAuthenticated, function(req,res) {
    ezhHelpers.pzhadaptor.installWidget(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, req.params.appUrl, function(result) {
      res.json(result.message);
    });
  });

  app.post('/ajax/approveFriend/:pzhId/:email', ezhHelpers.ensureAuthenticated, function (req, res) {
    ezhHelpers.pzhadaptor.approvePZHFriend(req.user, ezhHelpers.getPZHId(req), req.params.email, function(result) {
      res.json(result.message);
    });
  });

  app.post('/ajax/rejectFriend/:pzhId/:email', ezhHelpers.ensureAuthenticated, function (req, res) {
    ezhHelpers.pzhadaptor.rejectPZHFriend(req.user, ezhHelpers.getPZHId(req), req.params.email,function(result) {
      res.json(result.message);
    });
  });

  app.post('/ajax/removeFriend/:pzhId/:email/:externalPZH', ezhHelpers.ensureAuthenticated, function (req, res) {
    ezhHelpers.pzhadaptor.removePZHFriend(req.user, ezhHelpers.getPZHId(req), req.params.email, req.params.externalPZH, function(result) {
      res.json(result.message);
    });
  });

  // Remove app
  app.post('/ajax/remove-app/:pzhId/:pzpId/:appId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.removeWidget(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, req.params.appId, function(result) {
      res.json(result.message);
    });
  });

  // Wipe PZP
  app.post('/ajax/wipe/:pzhId/:pzpId', ezhHelpers.ensureAuthenticated, function(req, res) {
    ezhHelpers.pzhadaptor.wipe(req.user, ezhHelpers.getPZHId(req), req.params.pzpId, function(result) {
      res.json(result.message);
    });
  });
};
