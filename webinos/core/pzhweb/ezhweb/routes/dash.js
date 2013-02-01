/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/
module.exports = function (app, address, port, state) {
    "use strict";
    var dependency = require("find-dependencies")(__dirname),
        logger = dependency.global.require(dependency.global.util.location, "lib/logging.js")(__filename) || console,
        pzhadaptor = require('../../pzhadaptor.js'),
        passport = require('passport'),
        helper = require('../../routes/helper.js');

    var privilegedUsers = {
      "nick@nquiringminds.com": true,
      "toby.ealden@gmail.com": true
    };
    
    var pzhInfoCache = {};
    
    function getUIOptions(user) {
      return {
        appTitle: "UbiApps Enterprise Zone",
        appURL: "http://ubiapps.com",
        mainTheme: "d",
        optionTheme: "b",
        infoTheme: "c",
        dividerTheme: "d",
        collapsibleTheme: "d",
        privileged: isPrivileged(user),
        serverName: user ? getCurrentPZH(user) : ""
      };
    }
    
    function getCurrentPZH(user) {
      return address + "_" + user.emails[0].value;
    }
    
    function isPrivileged(user) {
      return user ? (user.emails[0].value in privilegedUsers) && user.from === 'google' : false;
    }

    function renderPZHHome(id, pzhId, req, res) {
      pzhadaptor.getPZHPZPs(req.user, pzhId, function(pzp_result) {
        pzhadaptor.getPZHPZHs(req.user, pzhId, function(pzh_result) {
          pzhadaptor.getPendingFriends(req.user, pzhId, function(pending_result) {
            var pzhName = (pzhId in pzhInfoCache) ? pzhInfoCache[pzhId].username : pzhId;
            res.render('pzh', { id:id, ui: getUIOptions(req.user), title: "Zone Details", pzhName: pzhName, pzh: pzhId, pzpList: pzp_result.message, pzhList: pzh_result.message, requestList: pending_result.message });
          });
        });
      });
    }

    function getPZHId(req) {
      if (isPrivileged(req.user)) {
        return req.params.pzhId;
      } else {
        return getCurrentPZH(req.user);
      }
    }
    
    function isMobile(req) {
      var ua = req.header('user-agent');
      return true; //(/mobile/i.test(ua)) ? true : false;
    }

    function splitAddress(addr) {
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
    }

    function displayEndpoint(addr) {
      var details = splitAddress(addr);
      return details.pzhHost + "/" + details.email + (details.pzp.length > 0 ? ("/" + details.pzp) : "");
    }

    function rationaliseServices(payload, pzhId, pzpId) {
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

    app.get('/', ensureAuthenticated, function (req, res) {
      if (req.session.isPzp) {
            pzhadaptor.fromWeb(req.user, {payload:{status:"enrollPzpAuthCode", address:address, port:port, pzpPort:req.session.pzpPort, user:getUserPath(req.user)}}, res);
            req.session.isPzp = "";
            req.session.pzpPort = "";
        } else {
          if (!isPrivileged(req.user)) {
            if (isMobile(req)) {
              renderPZHHome("home", getCurrentPZH(req.user), req,res);
            } else {
               res.send("<html><body>DESKTOP!</body></html>");
            }
          } else {
            if (isMobile(req)) {
              pzhadaptor.getFarmPZHs(req.user, function(result) {
                pzhInfoCache = result.message;
                res.render('dash', { id:"home", ui: getUIOptions(req.user), title: "UbiApps", pzhList: result.message });
              });
            } else {
               res.send("<html><body>PRIVILEDGED DESKTOP!</body></html>");              
            }
          }
        }
    });

    app.get('/pzh/:pzhId', ensureAuthenticated, function(req, res) {
      renderPZHHome("pzh",getPZHId(req),req,res);
    });

    app.get('/pzp/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      res.render('pzp', { id:"pzp", ui: getUIOptions(req.user), title: "Device", pzh: getPZHId(req), pzp: req.params.pzpId});
    });

    app.get('/installed/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getInstalledWidgets(req.user, getPZHId(req), req.params.pzpId, function(result) {
        res.render('installed', { id:"installed", ui: getUIOptions(req.user), title: "Apps", widgetList: result.message.installedList, pzh: getPZHId(req), pzp: req.params.pzpId });
      });      
    });
    
    app.get('/about-me/:pzhId', ensureAuthenticated, function(req,res) {
        pzhadaptor.getPZHDetails(req.user, getPZHId(req), function(result) {
          res.render('about-me', { id:"about-me", ui: getUIOptions(req.user), title: "About Zone", about: result.message, pzh: getPZHId(req) });
        });
    });

    app.get('/invite/:pzhId', ensureAuthenticated, function(req,res) {
      pzhadaptor.getFarmPZHs(req.user, function(result) {
        res.render('invite', { id:"invite", ui: getUIOptions(req.user), title: "Invite a Friend", pzh: getPZHId(req), pzhList: result.message });
      });
    });
    
    app.get('/approve/:pzhId', ensureAuthenticated, function(req,res) {
      pzhadaptor.getPendingFriends(req.user, getPZHId(req), function(lst) {
        res.render('approve', { id:"approve", ui: getUIOptions(req.user), title: "Approve friend", pzh: getPZHId(req), requestList: lst.message });
      });
    });
    
    app.get('/install-app/:pzhId/:pzpId', ensureAuthenticated, function(req,res) {
        res.render('install-app', { id:"installApp", ui: getUIOptions(req.user), title: "Install App", pzh: getPZHId(req), pzp: req.params.pzpId });    
    });
            
    app.get('/do-install/:pzhId/:pzpId/:appId', ensureAuthenticated, function(req,res) {
        var installUrl = "http://webinos.two268.com/apps/wgl-demo.wgt/wgl-demo.wgt";
        pzhadaptor.installWidget(req.user, getPZHId(req), req.params.pzpId, installUrl, function(result) {
          res.render('install-app-result', { id:"installAppResult", ui: getUIOptions(req.user), title: "Install App Result", pzh: getPZHId(req), pzp: req.params.pzpId, result: result.message });          
        });
    });
    
    app.get('/do-install-url/:pzhId/:pzpId/:appUrl', ensureAuthenticated, function(req,res) {
        pzhadaptor.installWidget(req.user, getPZHId(req), req.params.pzpId, req.params.appUrl, function(result) {
          res.render('install-app-result', { id:"installAppResult", ui: getUIOptions(req.user), title: "Install App Result", pzh: getPZHId(req), pzp: req.params.pzpId, result: result.message });          
        });
    });

    app.get('/app/:pzhId/:pzpId/:appId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getInstalledWidgets(req.user, getPZHId(req), req.params.pzpId, function(result) {
        var installId = req.params.appId;
        if (result.message.installedList.hasOwnProperty(installId)) {
          res.render('app', { id:"app", ui: getUIOptions(req.user), title: "App", app: result.message.installedList[installId], pzh: getPZHId(req), pzp: req.params.pzpId });
        } else {
          res.render('problem',{ id:"problem", ui: getUIOptions(req.user), title: "Problem", error: "App " + installId + " not found on device."});
        }
      });            
    });
    
    app.get('/remove-app/:pzhId/:pzpId/:appId', ensureAuthenticated, function(req, res) {
      pzhadaptor.removeWidget(req.user, getPZHId(req), req.params.pzpId, req.params.appId, function(result) {
        res.redirect('/installed/' + getPZHId(req) + "/" + req.params.pzpId);
      });
    });

    app.get('/wipe/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      res.render('success', { ui: getUIOptions(req.user), title: "Device Wiped", pzh: getPZHId(req), message: "Successfully wiped device " + req.params.pzpId});
    });

    app.post('/wipe/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      pzhadaptor.wipe(req.user, getPZHId(req), req.params.pzpId, function(result) {
        res.redirect('/wipe/' + req.params.pzhId + '/' + req.params.pzpId);
      });
    });

    app.get('/services/:pzhId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getActiveServices(req.user, getPZHId(req), function(result) {
        var entities = rationaliseServices(result.message);
        res.render('services-active', { id:"getActiveServices", ui: getUIOptions(req.user), title: "Active Services", pzh: getPZHId(req), entities: entities });
      });    
    });

    app.get('/services/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getActiveServices(req.user, getPZHId(req), function(activeResult) {
          var entities = rationaliseServices(activeResult.message, getPZHId(req), req.params.pzpId);
          res.render('services-active', { id:"getActiveServices", ui: getUIOptions(req.user), title: "Active Services", pzh: getPZHId(req), pzp: req.params.pzpId, entities: entities});
        });
    });

  /*
    app.get('/services/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getActiveServices(req.user, getPZHId(req), function(activeResult) {
        pzhadaptor.getDefaultServices(req.user, getPZHId(req), req.params.pzpId, function(defaultResult) {
          var entities = rationaliseServices(activeResult.message, getPZHId(req), req.params.pzpId);
          res.render('services', { id:"getActiveServices", ui: getUIOptions(req.user), title: "Active Services", pzh: getPZHId(req), pzp: req.params.pzpId, entities: entities, defaultServices: defaultResult.message.modules });
        });
      });
    });
  */

    app.get('/default-services/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getDefaultServices(req.user, getPZHId(req), req.params.pzpId, function(result) {
        res.render('services-default', { id:"getDefaultServices", ui: getUIOptions(req.user), title: "Default Services", pzh: getPZHId(req), pzp: req.params.pzpId, services: result.message.modules });
      });
    });

    app.get('/removeService/:pzhId/:pzpId/:serviceAddress/:serviceId/:serviceAPI', ensureAuthenticated, function(req,res) {
      res.render('success', { ui: getUIOptions(req.user), title: "Service Removed", pzh: getPZHId(req), message: "Successfully removed service " + req.params.serviceAPI});
    });

    app.post('/removeService/:pzhId/:pzpId/:serviceAddress/:serviceId/:serviceAPI', ensureAuthenticated, function(req,res){
      pzhadaptor.removeActiveService(req.user, getPZHId(req), req.params.serviceAddress, req.params.serviceId, req.params.serviceAPI, function(result) {
        res.redirect('/removeService/' + req.params.pzhId + '/' + req.params.pzpId + '/' + encodeURIComponent(req.params.serviceAddress) + '/' + req.params.serviceId + '/' + encodeURIComponent(req.params.serviceAPI));
      });
    });

    app.get('/nyi', function(req,res) {
      res.render('nyi',{ id:"nyi", ui: getUIOptions(req.user), title: "Not Implemented"});
    });

    app.get('/main/:user/', ensureAuthenticated, function (req, res) {
      res.redirect('/pzh/' + address + "_" + req.params.user);
    });

    // present certificates to an external party.
    app.all('/main/:useremail/certificates/', function (req, res) {
        //return a JSON object containing all the certificates.
        pzhadaptor.fromWebUnauth(req.params.useremail, {type:"getCertificates"}, res);
    });

    app.post('/main/:user/pzpEnroll', ensureAuthenticated, function (req, res) {
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
    app.get('/connect-friend/:pzhId/:connectPzhId', ensureAuthenticated, function (req, res) {
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
              pzhadaptor.addTrustedFriend(req.user, getPZHId(req),externalEmail, externalPZH, certs.message, function (status) {
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
                  res.render("problem",{ id:"problem", ui: getUIOptions(req.user), title: "Problem", error: "This person is already your friend, or there is a pending friend request.<br /><br />Certificate already exchanged."});
                }
              });
            }, function (err) {
                logger.log('Failed to retrieve certificate from remote host');
                res.render("problem",{ id:"problem", ui: getUIOptions(req.user), title: "Problem", error: "Failed to retrieve certificate from remote host."});
            });
        }

        // technically this is a problem.
        // someone could change the URI in transit to transfer different certificates
        // this would make Bob think that Alice was from a different personal zone.
        // TODO: Work out some way of putting the 'get' data into the body, despite this being a redirect.

    });

    app.get('/approveFriend/:pzhId/:email', ensureAuthenticated, function (req, res) {
      pzhadaptor.approvePZHFriend(req.user, getPZHId(req), req.params.email, function() {
        res.redirect('/pzh/' + getPZHId(req));
      });
    });

    app.get('/rejectFriend/:pzhId/:email', ensureAuthenticated, function (req, res) {
      pzhadaptor.rejectPZHFriend(req.user, getPZHId(req), req.params.email,function() {
        res.redirect('/pzh/' + getPZHId(req));
      });
    });

    app.get('/removeFriend/:pzhId/:email/:externalPZH', ensureAuthenticated, function (req, res) {
      pzhadaptor.removePZHFriend(req.user, getPZHId(req), req.params.email, req.params.externalPZH, function() {
        res.redirect('/pzh/' + getPZHId(req));
      });    
    });

    app.get('/login', function (req, res) {
        if (req.query.isPzp) {
            req.session.isPzp = true;
            req.session.pzpPort = req.query.port;
        }
        res.render('login', { user:req.user, id:"login", ui: getUIOptions(req.user), title: "UbiApps", isPZP: req.session.isPzp });
    });
    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve redirecting
    //   the user to google.com.  After authenticating, Google will redirect the
    //   user back to this application at /auth/google/return
    app.get('/auth/google', passport.authenticate('google', { failureRedirect:'/login' }),        
        function (req, res) {
            res.redirect('/');
        }
    );

    // GET /auth/google/return
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/google/return',
        passport.authenticate('google', { failureRedirect:'/login' }),
        function (req, res) {
            res.redirect('/');
        }
    );

    app.get('/logout', function (req, res) {
        req.logout();
        //window.open('https://www.google.com/accounts/Logout');
        //window.open('https://login.yahoo.com/config/login?logout=1');
        res.redirect('/');
    });

    app.get('/auth/yahoo',
        passport.authenticate('yahoo'),
        function (req, res) {
            // The request will be redirected to Yahoo for authentication, so
            // this function will not be called.
        }
    );

    app.get('/auth/yahoo/return',
        passport.authenticate('yahoo', { failureRedirect:'/login' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        }
    );

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          if ("pzhId" in req.params && req.params.pzhId != getCurrentPZH(req.user) && !isPrivileged(req.user)) {
            res.redirect("/");
          } else {
            return next();
          }          
        } else {
          res.redirect('/login');
        }
    }

    function getUserPath(user) {
        return encodeURIComponent(user.emails[0].value);
    }
};
