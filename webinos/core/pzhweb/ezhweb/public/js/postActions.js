// Page initialisation
$(document).on("pageinit", function() {

});

// Refesh buttons
$(document).on("click",".dash-refresh",function () {
  $(this).find(".ui-btn-text").html("Wait...");
  window.location.reload(true);
  return false;
});

$(document).on("click",".wipe-action",function() {
  $.post(this.href).done(function(data) {
      window.location.reload(true);
    }).fail(function(xhr,status,err) {
      alert("error!");
    });

  return false;
});

$(document).on("click",".install-action",function() {
  $.post(this.href).done(function(data) {
    window.location.reload(true);
    if (data.ok) {

    } else {

    }
  }).fail(function(xhr,status,err) {
      alert("error!");
    });

  return false;
});

$(document).on("click",".remove-app-action",function() {
  $.post(this.href).done(function(data) {
    window.location.reload(true);
    if (data.ok) {

    } else {

    }
  }).fail(function(xhr,status,err) {
      alert("error!");
    });

  return false;
});

$(document).on("click",".remove-friend-action",function() {
  $.post(this.href).done(function(data) {
    3
    if (data.ok) {

    } else {

    }
  }).fail(function(xhr,status,err) {
      alert("error!");
    });

  return false;
});

$(document).on("click",".approve-friend-action",function() {
  $.post(this.href).done(function(data) {
    window.location.reload(true);
    if (data.ok) {

    } else {

    }
  }).fail(function(xhr,status,err) {
      alert("error!");
    });

  return false;
});

$(document).on("click",".reject-friend-action",function() {
  $.post(this.href).done(function(data) {
    window.location.reload(true);
    if (data.ok) {

    } else {

    }
  }).fail(function(xhr,status,err) {
      alert("error!");
    });

  return false;
});
