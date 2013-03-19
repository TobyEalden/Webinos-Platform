module.exports = function(jobsPath) {
  var fs = require('fs');

  var jobStatusLookup = [
    "unknown",
    "order taken",
    "driver allocated",
    "on route",
    "picked up",
    "dropped off"
  ];

  var STATUS_UNKNOWN = 0;
  var STATUS_ORDER_TAKEN = 1;
  var STATUS_DRIVER_ALLOCATED = 2;
  var STATUS_ON_ROUTE = 3;
  var STATUS_PICKED_UP = 4;
  var STATUS_DROPPED_OFF = 5;
  var STATUS_ALL = 999;

  function Job(name,contact,pickup,dropoff,people,time) {
    this.id = 0;
    this.name = name;
    this.contact = contact;
    this.pickup = pickup;
    this.dropoff = dropoff;
    this.people = people;
    this.time = time;
    // Job status is stored as text rather than index as this makes it easier to display in views - needs optimising.
    this.status = jobStatusLookup[STATUS_UNKNOWN];
  }

  // Gets the index of a given job status - used for filtering.
  function jobStatusIndex(job) {
    var idx = -1;
    for (var i = 0; i < jobStatusLookup.length; i++) {
      if (jobStatusLookup[i] === job.status) {
        idx = i;
        break;
      }
    }

    return idx;
  }

  function loadJobs() {
    var jobData;
    if (fs.existsSync(jobsPath)) {
      var jobDataText = fs.readFileSync(jobsPath,"utf8");
      jobData = JSON.parse(jobDataText);
    } else {
      jobData = { nextId: 100, jobs: []}
    }
    return jobData;
  }

  function timeSort(a,b) {
    var aTime = new Date(a.time);
    var bTime = new Date(b.time);
    return aTime.getTime() - bTime.getTime();
  }

  function getJobs(filterFrom, filterTo, driverId) {
    var jobData = loadJobs();

    var jobList;
    if (typeof filterFrom === "undefined" && typeof filterTo === "undefined") {
      jobList = jobData.jobs;
    } else {
      jobList = [];
      for (var j in jobData.jobs) {
        var job = jobData.jobs[j];
        var jobStatus = jobStatusIndex(job);
        if (jobData.jobs.hasOwnProperty(j) &&
            (typeof filterFrom === "undefined" || jobStatus >= filterFrom) &&
            (typeof filterTo === "undefined" || jobStatus <= filterTo) &&
            (typeof driverId === "undefined" || jobData.jobs[j].driverId === driverId)) {
          jobList.push(job);
        }
      }
    }

    return jobList.sort(timeSort);
  }

  function saveJobs(jobs) {
    fs.writeFileSync(jobsPath,JSON.stringify(jobs,undefined,2));
  }

  function findJob(jobs,id) {
    var job = null;

    for (var j = 0; j < jobs.length; j++) {
      if (jobs[j].id === id) {
        job = jobs[j];
        break;
      }
    }

    return job;
  }

  function makeBooking(job) {
    var jobData = loadJobs();

    job.id = jobData.nextId++;
    job.status = jobStatusLookup[STATUS_ORDER_TAKEN];
    jobData.jobs.push(job);

    saveJobs(jobData);

    return job;
  }

  function allocateDriver(jobId, driverId) {
    var jobData = loadJobs();
    var job = findJob(jobData.jobs,jobId);

    job.status = jobStatusLookup[STATUS_DRIVER_ALLOCATED];
    job.driverId = driverId;

    saveJobs(jobData);
  }

  function updateJobStatus(jobId,jobStatus) {
    var ok = false;

    var jobData = loadJobs();
    var job = findJob(jobData.jobs,jobId);

    // Check job status is valid.
    if (jobStatusIndex(jobStatus)) {
      job.status = jobStatus;
      saveJobs(jobData);
      ok = true;
    }

    return ok;
  }

  function getCurrentJob(driverId) {
    var jobList = getJobs(STATUS_ON_ROUTE, STATUS_PICKED_UP, driverId);
    var job = null;
    if (jobList.length > 0) {
      job = jobList[0];
    }
    return job;
  }

  function getNextJob(driverId) {
    var jobList = getJobs(STATUS_DRIVER_ALLOCATED, STATUS_DRIVER_ALLOCATED, driverId);
    var job = null;
    if (jobList.length > 0) {
      job = jobList[0];
    }
    return job;
  }

  return {
    STATUS_UNKNOWN: STATUS_UNKNOWN,
    STATUS_ORDER_TAKEN: STATUS_ORDER_TAKEN,
    STATUS_DRIVER_ALLOCATED: STATUS_DRIVER_ALLOCATED,
    STATUS_ON_ROUTE: STATUS_ON_ROUTE,
    STATUS_PICKED_UP: STATUS_PICKED_UP,
    STATUS_DROPPED_OFF: STATUS_DROPPED_OFF,
    STATUS_ALL: STATUS_ALL,
    Job: Job,
    getJobs: getJobs,
    makeBooking: makeBooking,
    allocateDriver: allocateDriver,
    updateJobStatus: updateJobStatus,
    getCurrentJob: getCurrentJob,
    getNextJob: getNextJob
  }
};
