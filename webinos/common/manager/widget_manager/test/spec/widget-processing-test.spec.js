(function(){

/*
	Require modules
*/
var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	widgetmanager = require('../../index.js'),
	wm = widgetmanager.widgetmanager;

/*
	Helper
*/
function WidgetTestProcessor(wgtPath) {
	this.path = WidgetTestProcessor.suitePath + wgtPath;	
}

/*
	ToDo - parameterise this path
*/
WidgetTestProcessor.suitePath = '/home/toby/dev/2006/waf/widgets/test-suite/test-cases/';

WidgetTestProcessor.prototype.process = function(finished) {

	function processResult(res) {

		if (res.status) {
			//console.log('**** Invalid widget - process result status: ' + res.status);
		} else {
			//console.log(util.inspect(res.widgetConfig));
		}


		// Cancel the install at this point, as we have the config
		if (res.getInstallId() !== undefined) {
			wm.abortInstall(res.getInstallId());
		}

		if (finished) {
			// Pass the widget config on to the client callback.
			finished(res.widgetConfig);
		}
	}

	// Ask the widget manager to install the widget, and call us back with the result.
	wm.prepareInstall(this.path, {}, processResult);
}

/*
	TESTS START
*/
describe('ta-defaultlocale-ignore',function() {

	it('dlocignore01 - Tests that the user agent applies rule for getting a single attribute value to the defaultlocale attribute. To pass, the name of the widget must be the value PASS.',
		function(done) {
			var proc = new WidgetTestProcessor('ta-defaultlocale-ignore/001/ta-de-001.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});

	it('dlocignore02 - Test that the user agent matches obscure, yet valid, language tags. To pass, the widgets description must be the value PASS.',
		function(done) { 
			var proc = new WidgetTestProcessor('ta-defaultlocale-ignore/002/ta-de-002.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
	
});

/*
	Test expects invalid widget.
*/
describe('ta-ACCJfDGwDQ',function() {

	it('aa - Tests that the UA rejects configuration documents that don\'t have correct widget element at the root. To pass, the UA must treat this as an invalid widget (the root element is not widget).',
		function(done) {
			var proc = new WidgetTestProcessor('ta-ACCJfDGwDQ/000/aa.wgt');
			proc.process(function(cfg) { 
				// For an invalid widget, we expect the config to be undefined.
				expect(cfg).toBeUndefined();
				done();
			});
	});
});

describe('ta-argMozRiC', function() {

	it('Test that a user agent correctly processes a author element. To pass, the author name must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/000/af.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual('PASS');
				done(); });
	});

	it('Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space. To pass, the widget author must be the string "P A S S" (i.e., white space collapsed to single space).',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/001/ag.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual('P A S S');
				done();
			});
	});	
});

}());
