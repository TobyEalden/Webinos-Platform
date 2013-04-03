module.exports = function ubiTaxiStore(jobsPath){
  var fs = require('fs');

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

  function storeJobs(jobs) {
    fs.writeFileSync(jobsPath,JSON.stringify(jobs,undefined,2));
  }

  return {
    load: loadJobs,
    save: storeJobs
  };
};
