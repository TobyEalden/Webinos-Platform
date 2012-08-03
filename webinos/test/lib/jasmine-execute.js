(function() {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    //var reporter = new jasmine.HtmlReporter();
	//var reporter = new jasmine.ConsoleReporter(console.log);
	var reporter = new jasmine.TrivialReporter();
		
    jasmineEnv.addReporter(reporter);

    jasmineEnv.specFilter = function(spec) {
    return reporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;

    window.onload = function() {
    if (currentWindowOnload) {
        currentWindowOnload();
    }
    execJasmine();
    };

    function execJasmine() {
    jasmineEnv.execute();
    }

})();
