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

    var pzhInfoCache = {};
    var ui = {
      appTitle: "UbiApps",
      appURL: "http://ubiapps.com",
      mainTheme: "a",
      optionTheme: "b",
      infoTheme: "c",
      dividerTheme: "a",
      collapsibleTheme: "a",
      serverName: ""
    };
    
    function getCurrentFarm(user) {
      return address + "_" + decodeURIComponent(getUserPath(user));
    }
    
    app.get('/', ensureAuthenticated, function (req, res) {
      ui.serverName = getCurrentFarm(req.user);
      if (req.session.isPzp) {
            pzhadaptor.fromWeb(req.user, {payload:{status:"enrollPzpAuthCode", address:address, port:port, pzpPort:req.session.pzpPort, user:getUserPath(req.user)}}, res);
            req.session.isPzp = "";
            req.session.pzpPort = "";
        } else {
          pzhadaptor.getFarmPZHs(req.user, function(result) {
            pzhInfoCache = result.message;
            res.render('dash', { serverName: getCurrentFarm(req.user), id:"home", ui: ui, title: "UbiApps Zone Farm", pzhList: result.message });
          });
        }
    });
    
    app.get('/pzh/:pzhId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getPZHPZPs(req.user, req.params.pzhId, function(pzp_result) {
        pzhadaptor.getPZHPZHs(req.user, req.params.pzhId, function(pzh_result) {
          var pzhName = (req.params.pzhId in pzhInfoCache) ? pzhInfoCache[req.params.pzhId].username : req.params.pzhId;
          res.render('pzh', { serverName: getCurrentFarm(req.user), id:"pzh", ui: ui, title: "Zone Details", pzhName: pzhName, pzh: req.params.pzhId, pzpList: pzp_result.message, pzhList: pzh_result.message });
        });
      });
    });

    app.get('/pzp/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      res.render('pzp', { serverName: getCurrentFarm(req.user), id:"pzp", ui: ui, title: "Device", pzh: req.params.pzhId, pzp: req.params.pzpId});
    });

    app.get('/installed/:pzhId/:pzpId', ensureAuthenticated, function(req, res) {
      pzhadaptor.getInstalledWidgets(req.user, req.params.pzhId + "/" + req.params.pzpId, function(result) {
        res.render('installed', { serverName: getCurrentFarm(req.user), id:"installed", ui: ui, title: "Apps", widgetList: result.message.installedList, pzh: req.params.pzhId, pzp: req.params.pzpId });
      });      
    });
    
    app.get('/about-me/:pzhId', ensureAuthenticated, function(req,res) {
        pzhadaptor.getPZHDetails(req.user, req.params.pzhId, function(result) {
          res.render('about-me', { serverName: getCurrentFarm(req.user), id:"about-me", ui: ui, title: "About Zone", about: result.message, pzh: req.params.pzhId });
        });
    });

    app.get('/invite/:pzhId', ensureAuthenticated, function(req,res) {
      pzhadaptor.getFarmPZHs(req.user, function(result) {
        res.render('invite', { serverName: getCurrentFarm(req.user), id:"invite", ui: ui, title: "Invite a Friend", pzh: req.params.pzhId, pzhList: result.message });
      });
    });
    
    app.get('/approve/:pzhId', ensureAuthenticated, function(req,res) {
      pzhadaptor.getPendingFriends(req.user, req.params.pzhId, function(lst) {
        res.render('approve', { serverName: getCurrentFarm(req.user), id:"approve", ui: ui, title: "Approve friend", pzh: req.params.pzhId, requestList: lst.message });
      });
    });
        
    app.get('/nyi', function(req,res) {
      res.render('nyi',{ serverName: getCurrentFarm(req.user), id:"nyi", ui: ui, title: "Not Implemented"});
    });
        
    app.post('/main/:user/enrollPzp/', function (req, res) { // to use ensure authenticated, for some reason req.isAuthenticated retuns false
        pzhadaptor.fromWeb(req.params.user,{payload:{status:"enrollPzp", csr:req.body.csr, authCode:req.body.authCode, from:req.body.from}}, res);
    });

    app.get('/main/:user/', ensureAuthenticated, function (req, res) {
        if (encodeURIComponent(req.params.user) !== getUserPath(req.user)) {
            logger.log(encodeURIComponent(req.params.user) + " does not equal " + getUserPath(req.user));
            res.redirect('/login');
        } else {
            res.redirect('/pzh/' + address + "_" + req.params.user);
        }
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
            res.render("problem",{ serverName: getCurrentFarm(req.user), id:"problem", ui: ui, title: "Problem", error: "You cannot make friends with yourself."});
        } else {
            //get those certificates
            //"https://" + externalPZH + "/main/" + encodeURIComponent(externalEmail) + "/certificates/"
            helper.getCertsFromHost(externalEmail, externalPZH, function (certs) {
                pzhadaptor.storeExternalUserCert(req.user, externalEmail, externalPZH, certs.message, function (status) {
                    if (status.message) {//get my details from somewhere
                        var myCertificateUrl = "https://" + address + ":" + port + "/main/" + req.user.emails[0].value + "/certificates/";
                        var myPzhUrl = "https://" + address + ":" + port + "/main/" + req.user.emails[0].value + "/";
                        //where are we sending people
                        var redirectUrl = "https://" + externalPZH + "/main/" + encodeURIComponent(externalEmail) +
                            "/request-access-login?certUrl=" + encodeURIComponent(myCertificateUrl) +
                            "&pzhInfo=" + encodeURIComponent(myPzhUrl) + "&ownEmailId=" + getUserPath(req.user);
                        console.log("_-----------------_ redirecting to: " + redirectUrl);
                        res.redirect(redirectUrl);
                    } else {
                        logger.log('Certificate already exchanged');
                        res.render("problem",{ serverName: getCurrentFarm(req.user), id:"problem", ui: ui, title: "Problem", error: "This person is already your friend, or there is a pending friend request.<br /><br />Certificate already exchanged."});
                    }
                });
            }, function (err) {
                logger.log('Failed to retrieve certificate from remote host');
                res.render("problem",{ serverName: getCurrentFarm(req.user), id:"problem", ui: ui, title: "Problem", error: "Failed to retrieve certificate from remote host."});
            });
        }

        // technically this is a problem.
        // someone could change the URI in transit to transfer different certificates
        // this would make Bob think that Alice was from a different personal zone.
        // TODO: Work out some way of putting the 'get' data into the body, despite this being a redirect.

    });

    //TODO WARNING: This seems like a dodgy function.  Anyone can invoke it.  Make sure that secret is long...
    //    app.post('/main/:user/request-access/:external/', function(req, res) {
    //Args: External user's PZH URL
    //Args: Secret token
    //Args: Certificate for external PZH

    //Auth: check that the URL is expected and that the certificate is valid and that the certificate is valid for this URL.
    //UI: None
    //Action: add this user to the trusted list
    //    });

    app.get('/main/:user/approve-user/:externalemail/', ensureAuthenticated, function (req, res) {
        pzhadaptor.getRequestingExternalUser(req.user, req.params.externalemail, function (answer) {
            if (answer.message) {
                res.render("approve-user", {user:req.user, externalUser:req.params.externalemail});
            } else {
                res.render("problem",{ serverName: getCurrentFarm(req.user), id:"problem", ui: ui, title: "Problem", error: "Failed to approve user " + req.params.externalemail + "."});
            }
        });
        //Args: None
        //Auth: PZH login required
        //UI: Show the external user's details
        //Actions: have a button that, once approved, add the external user's certificate details to the trusted list.
    });

    app.get('/approveFriend/:pzhId/:email', ensureAuthenticated, function (req, res) {
      pzhadaptor.approvePZHFriend(req.user, req.params.pzhId, req.params.email, function() {
        res.redirect('/pzh/' + req.params.pzhId);
      });
    });

    app.get('/rejectFriend/:pzhId/:email', ensureAuthenticated, function (req, res) {
      pzhadaptor.rejectPZHFriend(req.user, req.params.pzhId, req.params.email,function() {
        res.redirect('/pzh/' + req.params.pzhId);
      });
    });

    app.get('/login', function (req, res) {
        if (req.query.isPzp) {
            req.session.isPzp = true;
            req.session.pzpPort = req.query.port;
        }
        res.render('login', { user:req.user, id:"login", ui: ui, title: "UbiApps Zone Farm" });
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
            return next();
        }
        res.redirect('/login');
    }

    function getUserPath(user) {
        return encodeURIComponent(user.emails[0].value);
    }
};
