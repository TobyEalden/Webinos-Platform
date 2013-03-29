module.exports = function(config, app, address, port, ezhHelpers) {
  var fs = require('fs');
  var path = require('path');
  var jobs = require('../ubitaxi-jobs.js')(path.join(config.metaData.webinosRoot,"ubitaxi","jobs.json"));
  var api = require('../ubitaxi-api.js')(jobs);

  var apiServer = new api.webSocketServer(6661);
  apiServer.start();

  app.get("/ubitaxi/book", function(req,res) {
    res.render("ubitaxi/book");
  });

  app.post("/ubitaxi/book", function(req,res) {
    var booking = new jobs.Job(req.body.name,req.body.contact,req.body.pickup,req.body.dropoff,req.body.people,req.body.pickupTime);
    jobs.makeBooking(booking);

    res.redirect("/ubitaxi/bookingComplete");
  });

  app.get("/ubitaxi/bookingComplete", function(req,res) {
    res.render("ubitaxi/bookingComplete");
  });

  app.post("/ubitaxi/setDriver/:jobId/:driverId", function(req,res){
    jobs.allocateDriver(parseInt(req.params.jobId), req.params.driverId);
    res.send("{'ok': true }");
  });

  app.post("/ubitaxi/updateJobStatus", function(req,res) {
    jobs.updateJobStatus(req.body.jobId,req.body.jobStatus);
    res.send("{'ok': true}");
  });

  app.get("/ubitaxi/jobs", ezhHelpers.ensureAuthenticated, function(req,res) {
   ezhHelpers.pzhadaptor.getZones(req.user, function(result) {
     var unallocatedJobList = jobs.getJobs(jobs.STATUS_ORDER_TAKEN, jobs.STATUS_ORDER_TAKEN);
     var allocatedJobList = jobs.getJobs(jobs.STATUS_DRIVER_ALLOCATED, jobs.STATUS_PICKED_UP);
     var finishedJobList = jobs.getJobs(jobs.STATUS_DROPPED_OFF, jobs.STATUS_ALL);
     res.render("ubitaxi/jobs", { ui: ezhHelpers.getUIOptions(req), drivers: result.message, unallocatedJobs: unallocatedJobList, allocatedJobs: allocatedJobList, finishedJobs: finishedJobList });
   });
  });

  app.get("/ubitaxi/drivers", ezhHelpers.ensureAuthenticated, function(req,res) {
    var unallocatedJobList = jobs.getJobs(jobs.STATUS_ORDER_TAKEN, jobs.STATUS_ORDER_TAKEN);
    ezhHelpers.pzhadaptor.getZones(req.user, function(result) {
      res.render("ubitaxi/drivers", { drivers: result.message, jobs: unallocatedJobList });
    });
  });

  /*
    AJAX api
   */
  app.get("/ubitaxi/api/pendingJobs", function(req,res) {
    var unallocatedJobList = jobs.getJobs(jobs.STATUS_ORDER_TAKEN, jobs.STATUS_ORDER_TAKEN);
    var callback = req.param("callback","callback");
    res.send(callback + "(" + JSON.stringify(unallocatedJobList) + ");");
  });

  app.get("/ubitaxi/api/allocatedJobs/:driverId", function(req,res) {
    var driverId = req.params.driverId;
    var allocatedJobList = jobs.getJobs(jobs.STATUS_DRIVER_ALLOCATED, jobs.STATUS_DRIVER_ALLOCATED,driverId);
    var callback = req.param("callback","callback");
    res.send(callback + "(" + JSON.stringify(allocatedJobList) + ");");
  });

  app.get("/ubitaxi/api/allocateJob/:jobId/:driverId", function(req, res) {
    var allocated = jobs.allocateDriver(parseInt(req.params.jobId), req.params.driverId);
    var callback = req.param("callback","callback");
    res.send(callback + "(" + (allocated ? "true" : "false") + ")");
  });

  app.get("/ubitaxi/api/currentJob/:driverId", function(req,res) {
    var currentJob = jobs.getCurrentJob(req.params.driverId);
    var callback = req.param("callback","callback");
    if (currentJob == null) {
      currentJob = jobs.getNextJob(req.params.driverId);
    }
    res.send(callback + "(" + JSON.stringify(currentJob) + ")");
  });

  app.get("/ubitaxi/api/updateJobStatus/:jobId/:status", function(req,res) {
    var updated = jobs.updateJobStatus(parseInt(req.params.jobId),req.params.status);
    var callback = req.param("callback","callback");
    res.send(callback + "(" + (updated ? "true" : "false") + ")");
  });
};
