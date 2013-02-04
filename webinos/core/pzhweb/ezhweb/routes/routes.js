module.exports = function (app, address, port, state) {
    "use strict";

    var passport = require('passport');
    var helper = require('../../routes/helper.js');
    var pzhadaptor = require('../../pzhadaptor.js');

    var helpers = function() {
      var getUserPath = function(user) {
        return encodeURIComponent(user.emails[0].value);
      };

      var isMobile = function (req) {
        var ua = req.header('user-agent');
        return true; (/mobile/i.test(ua)) ? true : false;
      };

      var getCurrentPZH = function (user) {
        return address + "_" + user.emails[0].value;
      };

      var isPrivileged = function (user) {
        var privilegedUsers = {
          "nick@nquiringminds.com": true,
          "toby.ealden@gmail.com": true
        };

        return user ? (user.emails[0].value in privilegedUsers) && user.from === 'google' : false;
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

      var rationaliseServices = function(payload, pzhId, pzpId) {
        var entities = {};
        for (var serv in payload.services){
          var s = payload.services[serv];
          var address = splitAddress(s.serviceAddress);
          if (!pzhId || address.pzh === pzhId) {
            if (!entities.hasOwnProperty(address.pzh)) {
              entities[address.pzh] = { services: {}, pzps: {} };
            }
            if (address.pzp && (!pzpId || address.pzp === pzpId)) {
              if (!entities[address.pzh].pzps.hasOwnProperty(address.pzp)) {
                entities[address.pzh].pzps[address.pzp] = { services: {} };
              }
              entities[address.pzh].pzps[address.pzp].services[s.id] = s;
            } else if (!pzpId) {
              entities[address.pzh].services[s.id] = s;
            }
          }
        }

        return entities;
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
        rationaliseServices: rationaliseServices
      }
    }();

    var mobileRoutes = require('./ezhweb-mobile');
    mobileRoutes(app, address, port, helpers);
    var desktopRoutes = require('./ezhweb-desktop');
    desktopRoutes(app, address, port, helpers);

    app.get('/', helpers.ensureAuthenticated, function(req,res) {
      if (helpers.isMobile(req)) {
        res.redirect('/m');
      } else {
        res.redirect('/d');
      }
    });

    app.get('/login', function(req,res) {
      if (req.query.isPzp) {
        req.session.isPzp = true;
        req.session.pzpPort = req.query.port;
        req.session.pzpHost = req.query.host;
      }
      if (helpers.isMobile(req)) {
        res.redirect('/m/login');
      } else {
        res.redirect('/d/login');
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
        if (helpers.isMobile(req)) {
          res.redirect('/m');
        } else {
          res.redirect('/');
        }
      }
    );
    app.get('/auth/yahoo/return',
      passport.authenticate('yahoo', { failureRedirect:'/' }),
      function (req, res) {
        if (helpers.isMobile(req)) {
          res.redirect('/m');
        } else {
          res.redirect('/');
        }
      }
    );

    app.get('/main/:user/', helpers.ensureAuthenticated, function (req, res) {
      if (helpers.isMobile(req)) {
        res.redirect('/m/pzh/' + address + "_" + req.params.user);
      } else {
        res.redirect('/d/pzh/' + address + "_" + req.params.user);
      }
    });

    // present certificates to an external party.
    app.all('/main/:useremail/certificates/', function (req, res) {
      //return a JSON object containing all the certificates.
      pzhadaptor.fromWebUnauth(req.params.useremail, {type:"getCertificates"}, res);
    });

    app.post('/main/:user/pzpEnroll', helpers.ensureAuthenticated, function (req, res) {
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
    app.get('/connect-friend/:pzhId/:connectPzhId', helpers.ensureAuthenticated, function (req, res) {
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
          pzhadaptor.addTrustedFriend(req.user, helpers.getPZHId(req),externalEmail, externalPZH, certs.message, function (status) {
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
};
