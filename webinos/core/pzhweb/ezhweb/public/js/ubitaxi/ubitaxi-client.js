// Store the jobid in temporary data.
$(document).on("click",".assignDriverPopup", function() { jQuery.data(document.body, "jobId", this.id); } );

// Store the driverId in temporary data.
$(document).on("click",".assignJobPopup", function() { jQuery.data(document.body, "driverId", this.id); } );

$(document).on("click",".assignDriver", function() {
  var driver = this.id;
  var jobId = jQuery.data(document.body, "jobId").split('-')[1];
  var url = '/ubitaxi/setDriver/' + jobId + '/' + driver;
  $.post(url).done(function(data) {
    window.location.reload(true);
  }).fail(function(xhr,status,err) {
      alert("error!");
  });
  return false;
});

$(document).on("click",".assignJob", function() {
  var jobId = this.id.split('-')[1];
  var driver = jQuery.data(document.body, "driverId").split('-')[1];
  var url = '/ubitaxi/setDriver/' + jobId + '/' + driver;
  $.post(url).done(function(data) {
    window.location.reload(true);
  }).fail(function(xhr,status,err) {
      alert("error!");
    });
  return false;
});
