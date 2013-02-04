$(function() {
  ubi.console.log("Initialising navigator");

  function toggleNode(n) {
    $(n).siblings("ul").each(function() { $(this).toggle(); });
    $(n).html($(n).html() === "+" ? "-" : "+");
  }

  $(".tree-branch").children("ul").each(function() { $(this).hide(); });
  $(".tree-expander").click(function() {
    toggleNode(this);
    return false;
  });

  $(".tree-expander").next("a").dblclick(function() {
    toggleNode($(this).prev("a"));
    return false;
  });

  $(".zone-tree-item").click(function() {
    var pzhId = this.id.substr(1);
    ubi.console.log("Loading details for zone " + pzhId);
    $.ajax({
      url: "/d/pzh/about/" + pzhId
    }).done(function(data){
        $("#centre").html(data);
      }).fail(function(xhr,status,err){
        ubi.console.log("Failed to load details for zone " + pzhId + ": " + status + " " + (err || ""), ubi.console.error);
      });
  });
});
