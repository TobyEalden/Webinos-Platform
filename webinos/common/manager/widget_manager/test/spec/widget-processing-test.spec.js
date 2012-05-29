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
/*
	Tests for defaultlocale-ignore
*/
describe('ta-defaultlocale-ignore',function() {
	it('dlocignore00 - Tests that an empty defaultlocale attribute is ignored (and does not cause the widget to be treated as invalid). To pass the widget but simply run',
		function(done {
			var proc new WidgetTestProcessor('ta-defaultlocale-ignore/000/dlocignore00.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeDefined();
				done();
			});
	});
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

 
	it('dlocignore03 - Tests that a language tag already part of the UA\'s locales list is ignored when it is repeated for defaultlocale attribute. To pass, the specified value should not be added twice to the locales list of the UA.',
		function(done) {
			var proc = new WidgetTestProcessor('ta-defaultlocale-ignore/003/ta-de-003.wgt');
			proc.process(function(cfg) {
				//TODO
		});
	});
	it('dlocignore04 -Tests that the default locale is added to the end of the user agent\'s locale list (and does not override the default language, which is assumed to be "en"). To pass, the name of the widget must be PASS.'),
		function(done) {
			var proc = new WidgetTestProcessor('ta-defaultlocale-ignore/004/ta-de-004.wgt');
			proc.process(function(cfg) {
				expect(cfg.name.unicode).toEqual ('PASS');
				done();
		});
	});
});

/*
	Tests for defaultlocale-process	
*/

describe('ta-defaultlocale-process', function() {
	it('dlocuse00 - Tests that the value of defaultlocale is also used to in folder-based localization. To pass, the index.html of the folder \'locales/esx-al/\' should be loaded and say PASS.'),
		function(done) {
			var proc = new WidgetTestProcessor('ta-defaultlocale-usage/000/locales/en-gb/index.html');
			proc.process(function(cfg) {
				expect(cfg.innerText).toEqual ('PASS');
				done();
		});
	});

	it('dlocuse01 - Tests that the value of defaultlocale works in conjunction to xml:lang on the widget element.		To pass, the name of the widget must be PASS.'),
		function(done) {
			var proc = new WidgetTestProcessor('ta-defaultlocale-usage/001/dlocuse01.wgt');
			proc.process(function(cfg) {
				expect(cfg.name.unicode).toEqual ('PASS');
				done();
		});
	})
});

/*
Tests for ta-ACCJfDGwDQ
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

	it('ab -Tests that the UA rejects configuration documents that don\'t have correct widget element at the root. To pass, the UA must treat this as an invalid widget (the namespace is wrong).'),
		function(done) {
			var proc = new WidgetTestProcessor('ta-ACCJfDGwDQ/001/ab.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
	
	it('ac -Tests that the UA rejects configuration documents that don\'t have correct widget element at the root.To pass, the UA must treat this as an invalid widget (the namespace is missing).'),
		function(done) {
			var proc = new WidgetTestProcessor('ta-ACCJfDGwDQ/002/ac.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
});
/* 
	Tests for ta-argMozRiC
*/

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
				expect(cfg.authorname.unicode).toEqual('P A S S');
				done();
			});
	});	
	
	it('Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space.	To pass, the author name must be the string "PASS" (i.e., all white space collapsed to single space, spaces at start/end trimmed).',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/002/ah.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual('PASS'); 
				done();
			});
	});	
	it('	Test that a user agent correctly applies the rule for getting a single attribute value.	To pass, the author email must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/003/ai.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.email.unicode).toEqual('PASS'); 
				done();
			});
	});	
	it('Test that a user agent correctly applies the rule for getting a single attribute value and the Rule for Getting Text Content with normalized White Space.To pass, the author name must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/004/aj.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual('PASS'); 
				done();
			});
	});	
	it('	Test that a user agent correctly applies the rule for getting a single attribute value and the Rule for Getting Text Content with Normalized White Space.	To pass, the author name must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/005/ak.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual('PASS'); 
				done();
			});
	});
	it('Test the ability of the user agent to handle an empty author element.	To pass, the author name must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/006/al.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual(''); 
				done();
			});
	});	
	it('	Test the ability of the user agent to correctly process the author href attribute.	To pass, the value of author href must be "PASS:PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/007/am.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.href.unicode).toEqual('PASS:PASS'); 
				done();
			});
	});	
	it('	Test the ability of the user agent to correctly process the author href attribute.	To pass, the value of author href must be ignored.',
		function(done) {
			var proc = new WidgetTestProcessor('ta-argMozRiC/008/an.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.href).toBeUndefined();
			});
	});	

});

/* 
	Tests for ta-AYLMhryBnD
	*/
	
describe('ta-AYLMhryBnD', function() {
	it('	Test that a user agent correctly processes a name element.	To pass, the widget name must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/000/ao.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
	it('	Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space.	To pass, the widget name must be the string "P A S S" (i.e., white space collapsed to single space).',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/001/ap.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('P A S S');
				done();
			});
	});
	it('	Test that a user agent correctly applies the Rule for Getting Text Content with Normalized White Space.	To pass, the widget name must be the string "PASS" (i.e., all white space collapsed to single space, spaces at front/back trimmed).',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/002/aq.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
	it('Test that a user agent correctly applies the rule for getting a single attribute value.	To pass, the widget short name must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/003/ar.wgt');
			proc.process(function(cfg) { 
				expect(cfg.shortName).toEqual('PASS'); 
				done();
			});
	});
	it('Test that a user agent correctly applies the rule for getting a single attribute value and	the Rule for Getting Text Content with Normalized White Space.	To pass, the widget short name must be the string "PASS" and the widget name must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/004/as.wgt');
			proc.process(function(cfg) { 
				expect(cfg.shortName).toEqual('PASS');  
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
	it('Test that a user agent correctly applies the rule for getting a single attribute value and	the Rule for Getting Text Content with Normalized White Space.	To pass, the widget short name must be the string "PASS" and the widget name must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/005/at.wgt');
			proc.process(function(cfg) { 
				expect(cfg.shortName.unicode).toEqual('PASS'); 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
	it('	Test that a user agent correctly processes the short attribute.	To pass, the widget short name must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/006/au.wgt');
			proc.process(function(cfg) { 
				expect(cfg.shortName.unicode).toEqual(''); 
				done();
			});
	});
	it('		Test the ability of the user agent to handle an empty name element.	To pass, the widget name must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/007/av.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual(''); 
				done();
			});
	});
	it('	Test that a user agent correctly processes a name element with xml:lang attribute.	To pass, the widget name must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('ta-AYLMhryBnD/008/oa.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS'); 
				done();
			});
	});
});

/* 
	Test cases for ta-BnWPqNvNVo
*/
describe('ta-BnWPqNvNVo', function() {
	it('		Test that the user agent does not attempt to load a default start file when a custom start file has been declared.	To pass, the widget start file must point to "pass.html" and the icons list must contain a pointer to "icon.png" at the root of the widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BnWPqNvNVo/000/aw.wgt');
			proc.process(function(cfg) { 
				expect(cfg.content.src.unicode).toEqual('pass.html');
				expect('icon.png' in cfg.icons).toBeTruthy();
				done();
			});
	});
});
/*
	Test cases for ta-BxjoiWHaMr
*/
describe('ta-BnWPqNvNVo', function() {
	it('		Test the UA\'s ability process the height attribute.	To pass, the widget height must be either the numeric value 123 or a value greater than 0.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/000/ax.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toBeGreatherThan(0);
				expect(cfg.height).toEqual(123);
				done();
			});
	});
	it('	Test the UA\'s ability process the height attribute.	To pass, the user agent must ignore the value of the height attribute (the value is composed of characters).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/001/ay.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute.	To pass, the widget height must be the numeric value 100 or a value greater than 0 (resulting from rule for parsing a non-negative integer).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/002/az.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toEqual(100);
				expect(cfg.height).toBeGreaterThan(0);
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute.	To pass, the widget height must be the numeric value 123 or a value greater than 0 (resulting from rule for parsing a non-negative integer).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/003/a1.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toEqual(123);
				expect(cfg.height).toBeGreatherThan(0);
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute.	To pass, the widget height must be ignored (the value is an empty string, hence it would be ignored).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/004/a2.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute.To pass, the widget height must be ignored (the value is a sequence of space characters, hence it would be ignored).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/005/a3.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute.	To pass, the widget height must be ignored (the value is an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-BxjoiWHaMr/006/a4.wgt');
			proc.process(function(cfg) { 
				expect(cfg.height).toBeUndefined();
				done();
			});
	});
});

/*
	Test cases for ta-DwhJBIJRQN
*/
describe('ta-DwhJBIJRQN', function() {
	it('	Test that the UA skips preference elements without a name attribute.	To pass, widget preferences must remain an empty list (i.e., the preference is skipped).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/000/a5.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preference.unicode).toBeUndefined); 
				expect(cfg.preferences.length).toEqual(0);
				done();
			});
	});
	it('	Test that the UA skips preference element already defined.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/001/a6.wgt');
			proc.process(function(cfg) { 
				expect(((cfg.preference["PASS"].value.unicode).toEqual('PASS')) && ((cfg.preference["PASS"].readonly.unicode).toEqual('false'))); 
				expect(cfg.preferences.length).toEqual(1);
				expect("PASS" in cfg.preferences);
				expect(cfg.preferences["PASS"].value).toEqual("PASS");
				expect(cfg.preferences["PASS"].readonly).toBeFalsy();
				done();
			});
	});
	it('	Test that the UA does a case sensitive comparison on the value of the readonly attribute.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/002/a7.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preferences.length).toEqual(1);
				expect("PASS" in cfg.preferences);
				expect(cfg.preferences["PASS"].value).toEqual("PASS");
				expect(cfg.preferences["PASS"].readonly).toBeFalsy();
				done();
			});
	});
	it('		Test that the UA does a case sensitive comparison on the value of the readonly attribute.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "true".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/003/a8.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preferences.length).toEqual(1);
				expect("PASS" in cfg.preferences);
				expect(cfg.preferences["PASS"].value).toEqual("PASS");
				expect(cfg.preferences["PASS"].readonly).toBeTruthy();
				done();
			});
	});
	it('	Test that the UA sets the readonly attribute to false by default.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/004/a9.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preferences.length).toEqual(1);
				expect("PASS" in cfg.preferences);
				expect(cfg.preferences["PASS"].value).toEqual("PASS");
				expect(cfg.preferences["PASS"].readonly).toBeFalsy();
				done();
			});
	});	
	it('		Test that the UA skips multiple preference element already defined.	To pass, widget preference must contain one preference whose name is "a" and whose value is "a" and whose readonly attr value must be "false".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/005/ba.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preferences.length).toEqual(1);
				expect("a" in cfg.preferences);
				expect(cfg.preferences["a"].value).toEqual("a");
				expect(cfg.preferences["PASS"].readonly).toBeFalsy();
				done();
			});
	});	
	it('Test the UA\'s ability store preferences whose name vary only in case.	To pass, widget preference must contain two preferences: 1 must have a name "a" and whose value is "a" and whose readonly attr value must be "false". 2 must have a name "A" and whose value is "b" and whose readonly attribute value must be "false".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/006/bb.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preferences.length).toEqual(2);
				expect("a" in cfg.preferences);
				expect("A" in cfg.preferences);
				expect(cfg.preferences["a"].value).toEqual("a");
				expect(cfg.preferences["a"].readonly).toBeFalsy();
				expect(cfg.preferences["A"].value).toEqual("b");
				expect(cfg.preferences["A"].readonly).toBeFalsy();
				done();
			});
	});	
	it('	Tests that the UA applies the rule for getting a single attribute value to name, value, and readonly attributes.	To pass, widget preference must contain one preference whose name is "PASS" and whose value is "PASS" and whose readonly attr value must be "false".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-DwhJBIJRQN/007/bc.wgt');
			proc.process(function(cfg) { 
				expect(cfg.preferences.length).toEqual(1);
				expect("PASS" in cfg.preferences);
				expect(cfg.preferences["PASS"].value).toEqual("PASS");
				expect(cfg.preferences["PASS"].readonly).toBeFalsy();
				done();
			});
	});	
});
/*
	Test cases for ta-dxzVDWpaWg
*/
describe('ta-dxzVDWpaWg', function() {
	it('	Test to make sure that the UA only checks the root of the widget for config files, and not in an arbitrary folder.	To pass, the user agent must treat this widget as an invalid widget (config file is not at the root).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-dxzVDWpaWg/000/bg.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined(); 
				done();
			});
	});	
	it('Test to make sure that the UA only checks the root of the widget for config files, and not in a locale folder.	To pass, the user agent must treat this widget as an invalid widget (config file is not at the root, but in locale folder).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-dxzVDWpaWg/001/bh.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined(); 
				done();
			});
	});
});
/*
	Test cases for ta-FAFYMEGELU
*/
describe('ta-FAFYMEGELU', function() {
	it('Tests the UA\'s ability to locate an icon at the root of the widget. To pass, after processing, the icons list must contain "icon.png",	which is at the root of the widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/000/bj.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["icon.png"]).toBeDefined();
				done();
			});
	});
	it('	Tests the UA\'s ability to locate an icon in a locale folder.	To pass, after processing, the icons list must contain a pointer to "locales/en/icon.png"',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/001/bk.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
				done();
			});
	});
	it('	Tests the UA\'s ability to locate an icon in a locale folder and at the root of the widget.	To pass, after processing, the icons list must contain a pointer to "locales/en/icon.jpg", and "icon.png", which is at the root of the widget.	The icons list can be in any order, so long as it contains "icon.png" and "locales/en/icon.jpg".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/002/bl.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
				expect(cfg.icons["icon.png"]).toBeDefined();
				done();
			});
	});
	it('	Tests the UA\'s ability to deal with custom icon declaration in the config document and matching default icons.	To pass, the icons list must contain a pointer to "locales/en/icon.jpg", and "icon.png", which is at the root of the widget.	The icons list can be in any order, so long as it contains "icon.png" and "locales/en/icon.jpg".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/003/bm.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
				expect(cfg.icons["icon.png"]).toBeDefined();
				done();
			});
	});
	it('	Tests the UA\'s ability to deal with custom icon declarations in the config document and matching default icons. To pass, the icons list must contain a pointer to "icons/pass.png", and "locales/en/icon.png" (ordering of the items in the list is irrelevant).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/004/bn.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
				expect(cfg.icons["icons/pass.png"]).toBeDefined();
				done();
			});
	});
	it('Test the UA\'s ability to load default icons in the correct order.	To pass, the icons list must contain "icon.png" and \'icon.jpg\'.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/005/bo.wgt');
			proc.process(function(cfg) { 
				var firstProp;
				for(var icon in cfg.icons) {
					if(cfg.icons.hasOwnProperty(icon)) {
						firstProp = cfg.icons[icon];
						break;
					}
				} //TODO not sure if this is valid for checking ordering
				expect(firstProp).toEqual("icon.png");
				expect(cfg.icons["icon.jpg"]).toBeDefined();
				done();
			});
	});
	it('	Test the UA\'s ability to load default icons.	To pass, the icons list must contain a pointer to "locales/en/icon.png" (order in the list is not relevant).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/006/bp.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["locales/en/icon.png"]).toBeDefined();
				done();
			});
	});
	it('	Tests if the UA treats file names in the default icons files table case-sensitively.To pass, the icons list must only contain a pointer to "icon.png"	at the root of the widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/007/ad.wgt');
			proc.process(function(cfg) { 
				var firstProp;
				var iconNum;
				iconNum = cfg.icons.length;
				for(var icon in cfg.icons) {
					if(cfg.icons.hasOwnProperty(icon)) {
						firstProp = cfg.icons[icon];
					}
				}
				expect(((firstProp).toEqual("icon.png")) && ((iconNum).toEqual(1)));
				done();
			});
	});
	it('Tests if the UA treats file names in the default icons files table case-sensitively.To pass, the icons list must only contain a pointer to "locales/en/icon.png".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-FAFYMEGELU/008/ae.wgt');
			proc.process(function(cfg) { 
				var firstProp;
				var iconNum;
				iconNum = cfg.icons.length;
				for(var icon in cfg.icons) {
					if(cfg.icons.hasOwnProperty(icon)) {
						firstProp = cfg.icons[icon];
					}
				}
				expect(((firstProp).toEqual("locales/en/icon.png")) && ((iconNum).toEqual(1)));
				done();
			});
	});
});
/*
	Tests for ta-hkWmGJgfve
*/
describe('ta-hkWmGJgfve', function() {
	it('Tests the UA\'s ability to ignore subsequent repetitions of the content element. To pass, the widget start file must be "pass.html".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-hkWmGJgfve/000/bq.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("pass.html");
				done();
			});
	});
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the content element.	To pass, the widget must be treated by the user agent as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-hkWmGJgfve/001/br.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the content element.To pass, the widget start file must be "pass.html".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-hkWmGJgfve/002/bs.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("pass.html");
				done();
			});
	});
});
/*
	Test cases for ta-klLDaEgJeU
*/
describe('ta-klLDaEgJeU', function() {
	it('	Test to make sure the user agent rejects malformed XML.	To pass, the widget must be treated as invalid by the user agent.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-klLDaEgJeU/000/bt.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('		Test to make sure the user agent rejects malformed XML.	To pass, the widget must be treated as invalid by the user agent.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-klLDaEgJeU/001/bu.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('	Tests support of XML, XMLNS, and UTF-8.	To pass, the user agent must load \'pass&amp;.html\' as the start file.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-klLDaEgJeU/002/bv.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("pass&amp;.html");
				done();
			});
	});
	it('Tests support of XML, XMLNS, and UTF-8. To pass, the widget author must be the string \'PASS\'.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-klLDaEgJeU/003/bw.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.name.unicode).toEqual("PASS"); 
				done();
			});
	});
	it('Tests support of XML, by making sure the user agent treats &lt; as malformed XML. To pass, the user agent must treat this as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-klLDaEgJeU/004/lt.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('Tests support of XML, by making sure the user agent treats &amp; as malformed XML. To pass, the user agent must treat this as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-klLDaEgJeU/005/amp.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
});
/*
	Tests for ta-LYLMhryBBT
*/
describe('ta-klLDaEgJeU', function() {
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the name element.	To pass, the name of the widget must be "PASS"..',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LYLMhryBBT/000/bx.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the name element.	To pass, the name of the widget must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LYLMhryBBT/001/by.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('');
				done();
			});
	});
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the name element.	To pass, the name of the widget must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LYLMhryBBT/002/bz.wgt');
			proc.process(function(cfg) { 
				expect(cfg.name.unicode).toEqual('PASS');
				done();
			});
	});
});
/*
	Tests for ta-RawAIWHoMs
*/
describe('ta-RawAIWHoMs', function() {
	it('	Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, the widget id must be "pass:".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RawAIWHoMs/000/b1.wgt');
			proc.process(function(cfg) { 
				expect(cfg.id).toEqual('pass:');
				done();
			});
	});
	it('Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, the widget id must ignore the value (not a valid IRI).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RawAIWHoMs/001/rd.wgt');
			proc.process(function(cfg) { 
				expect(cfg.id)toBeUndefined(); 
				done();
			});
	});
	it('Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, the widget id must equal "pass:" (applies rule for getting a single attribute value).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RawAIWHoMs/002/b2.wgt');
			proc.process(function(cfg) { 
				expect(cfg.id).toEqual('pass:');
				done();
			});
	});
	it('Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, id the attribute is ignored, as it is an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RawAIWHoMs/id-empty/id-empty.wgt');
			proc.process(function(cfg) { 
				expect(cfg.id).toBeUndefined();
				done();
			});
	});
	it('Tests the ability for a UA to correctly process an widget element\'s id attribute.	To pass, id the attribute is ignored, as it is an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RawAIWHoMs/id-empty-with-spaces/id-empty-with-spaces.wgt');
			proc.process(function(cfg) { 
				expect(cfg.id).toBeUndefined();
				done();
			});
	});
});
/*
	Test cases for ta-RGNHRBWNZV
*/
describe('ta-RawAIWHoMs', function() {
	it('Tests the user agent\'s ability to select start files in the appropriate order.	To pass, the user agent must select index.htm as the start file.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/008/cc.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path)toEqual("index.htm");
				done();
			});
	});
	it('Tests the user agent\'s ability to select start files in the appropriate order.	To pass, the user agent must select  index.html as the start file.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/009/cv.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path)toEqual("index.html");
				done();
			});
	});
	it('Tests to see if the user agents applies the algorithm to locate a default start file, when no custom start file is present.	To pass, index.htm must be the widget start file and the start file content-type must be text/html.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/000/b3.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path)toEqual("index.htm");
				expect(cfg.startFile.type)toEqual("text/html"); //TODO -- Correct way to check type?
				done();
			});
	});
	it('	Tests to see if the user agents applies the algorithm to locate a default start file, when no custom start file is present.	To pass, index.html must be the widget start file and the start file content-type must be text/html.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/001/b4.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path)toEqual("index.html");
				expect(cfg.startFile.type)toEqual("text/html");
				done();
			});
	});
	it('Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/002/b0.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/003/c1.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/004/c2.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('Tests the UA\'s ability treat file names in the default start files table case-sensitively.	To pass, the user agent must treat this widget as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/005/c3.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('	Tests the UAs ability treat file names in the default start files table case-sensitively.	To pass, the user agent must ignore "INdeX.htm" at the root, but must use "index.html" as the default start file.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/006/c4.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.html");
				done();
			});
	});
	it('	Tests the UAs ability treat file names in the default start files table case-sensitively.	To pass, the user agent must ignore "INdeX.htm" in the locales folder, but must use "index.html" as the default start file.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RGNHRBWNZV/007/c5.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.html");
				done();
			});
	});
});
/*
	Test cases for ta-RRZxvvTFHx
*/
describe('ta-RRZxvvTFHx', function() {
	it('Tests that a UA does not go searching in an arbritrary folder ("abc123") for default start files.	To pass, the user agent must treat this widget as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RRZxvvTFHx/000/b5.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('	Tests that a UA does not go searching in an arbritrary folder ("foo/bar") for default start files.	To pass, the user agent must use index.html at the root of the widget as the start file',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-RRZxvvTFHx/001/b6.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.html");
				done();
			});
	});
});
/*
	Test cases for ta-sdwhMozwIc
*/
describe('ta-sdwhMozwIc', function() {
	it('Tests the UA\'s ability to ignore subsequent repetitions of the author element.	To pass, the author name must be  "PASS", href must be "PASS:" and email must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-sdwhMozwIc/000/b7.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.unicode).toEqual("PASS");
				expect(cfg.author.href.unicode).toEqual("PASS");
				expect(cfg.author.email.unicode).toEqual("PASS");
				done();
			});
	});
	it('Tests the UA\'s ability to ignore subsequent repetitions of the author element.	To pass, the author name must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-sdwhMozwIc/001/b8.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.unicode).toEqual("");
				done();
			});
	});
	it('Tests the UA\'s ability to ignore subsequent repetitions of the author element.	To pass, the author name must be "PASS", href must be "PASS:" and email must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-sdwhMozwIc/002/b9.wgt');
			proc.process(function(cfg) { 
				expect(cfg.author.unicode).toEqual("PASS");
				expect(cfg.author.href).toEqual("PASS:");
				expect(cfg.author.email).toEqual("PASS");
				done();
			});
	});
});
/* 
	Test cases for ta-UEMbyHERkI
*/
describe('ta-UEMbyHERkI', function() {
	it('Tests the UA\'s ability to ignore subsequent repetitions of the description element.	To pass, the widget description must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UEMbyHERkI/000/c6.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("PASS");
				done();
			});
	});
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the description element.	To pass, the widget description must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UEMbyHERkI/001/c7.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("");
				done();
			});
	});
	it('Tests the UA\'s ability to ignore subsequent repetitions of the description element.	To pass, the widget description must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UEMbyHERkI/002/rb.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("PASS");
				done();
			});
	});
	it('	Tests the UA\'s ability to correctly select the description element when the xml:lang attribute is present.	To pass, the widget description must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UEMbyHERkI/003/c8.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("PASS");
				done();
			});
	});
});
/*
	Test cases for ta-UScJfQHPPy
*/
describe('ta-UScJfQHPPy', function() {
	it('Test the UA\'s ability process the width attribute.	To pass, the value of the widget width must be ignored (the value is composed of characters).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/000/c9.wgt');
			proc.process(function(cfg) { 
				expect(cfg.width).toBeUndefined();
				done();
			});
	});
	it('	Test the UA\'s ability process the width attribute.	To pass, the widget width must be the value "123" or a value greater than 0. ',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/001/cq.wgt');
			proc.process(function(cfg) { 
				expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0); 			
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute.	To pass, the widget width must be the numeric value 200 or a value greater than 0 (resulting from rule for parsing a non-negative integer).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/002/cw.wgt');
			proc.process(function(cfg) { 
				expect(cfg.width).toEqual(200) || expect(cfg.width).toBeGreaterThan(0);			
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute.	To pass, the widget width must be the numeric value 123  or a value greater than 0(resulting from rule for parsing a non-negative integer).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/003/ce.wgt');
			proc.process(function(cfg) { 
				expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0); 			
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute.	To pass, the user agent must assign some default width to the widget (the value is an empty string, hence it would be ignored).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/004/cr.wgt');
			proc.process(function(cfg) { 
				
				expect(cfg.width).toBeGreaterThan(0); 
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute.	To pass, the user agent must assign some default width to the widget (the value is a sequence of space characters, hence it would be ignored).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/005/ct.wgt');
			proc.process(function(cfg) { 
				expect(cfg.width).toBeGreaterThan(0); 		
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute.	To pass, the user agent must assign some default width to the widget (the value is a sequence of space characters, hence it would be ignored).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-UScJfQHPPy/006/cy.wgt');
			proc.process(function(cfg) { 
				expect(cfg.width).toBeGreaterThan(0); 		
				done();
			});
	});
});
/* 
	Test cases for ta-vcYJAPVEym
*/
describe('ta-UScJfQHPPy', function() {
	it('	Tests the UA\'s ability to ignore subsequent repetitions of the license element.	To pass, the widget license be the string "PASS" and license href must be the string "PASS:".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-vcYJAPVEym/000/cu.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("PASS");
				expect(cfg.license.href.unicode).toEqual("PASS:");
				done();
			});
	});
	it('Tests the UA\'s ability to ignore subsequent repetitions of the license element.	To pass, the widget license must be an empty string and widget license href must be ignored.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-vcYJAPVEym/001/ci.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("");
				expect(cfg.license.href.unicode).toBeUndefined();
				done();
			});
	});
	it('Tests the UA\'s ability to ignore subsequent repetitions of the license element.	To pass, widget license must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-vcYJAPVEym/002/ra.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Tests the UA\'s ability to correctly select a license element that makes use of xml:lang.	To pass, widget license must be "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-vcYJAPVEym/003/co.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("PASS");			
				done();
			});
	});
});
/*
	Test cases for ta-VdCEyDVSA
*/
describe('ta-VdCEyDVSA', function() {
	it('	Test the ability of the user agent to correctly apply the rule for getting text content to a description element.	To pass, the value of the widget description must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VdCEyDVSA/000/cp.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process the description element.	To pass, the value of the widget description must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VdCEyDVSA/001/ca.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process the description element.	To pass, the value of the widget description must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VdCEyDVSA/002/cs.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process the description element.To pass, the value of the widget description must be a string that corresponds to the following bytes (ASCII): 0A 09 50 0A 09 41 0A 09 53 0A 09 53 0A',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VdCEyDVSA/003/cd.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.ASCII).toEqual("0A 09 50 0A 09 41 0A 09 53 0A 09 53 0A");	//TODO -- Unsure if this will work.	
				done();
			});
	});
	it('Test the ability of the user agent to correctly process localized description elements by ignoring languages it does not know (i.e., selecting the unlocalized content).To pass, the value of the widget description must the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VdCEyDVSA/004/x1.wgt');
			proc.process(function(cfg) { 
				expect(cfg.description.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process localized description elements.	To pass, the value of the widget description must the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VdCEyDVSA/005/x2.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("PASS");			
				done();
			});
	});
});
/*
	Test cases for ta-VerEfVGeTc
*/
describe('ta-VerEfVGeTc', function() {
	it('Test the UA\'s ability to process version a version attribute.	To pass, the value of widget version must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VerEfVGeTc/000/cf.wgt');
			proc.process(function(cfg) { 
				expect(cfg.version.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Test the UA\'s ability to process version a version attribute.	To pass, the value of version must be an empty string  (applies rule for getting a single attribute value).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VerEfVGeTc/001/cg.wgt');
			proc.process(function(cfg) { 
				expect(cfg.version.unicode).toEqual("");			
				done();
			});
	});
	it('Test the UA\'s ability to process version a version attribute.	To pass, the value of widget version must be the string "PASS" (applies rule for getting a single attribute value).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-VerEfVGeTc/002/ch.wgt');
			proc.process(function(cfg) { 
				expect(cfg.version.unicode).toEqual("PASS");			
				done();
			});
	});
});
/*
	Test cases for ta-YUMJAPVEgI
*/
describe('ta-YUMJAPVEgI', function() {
	it('Test the ability of the user agent to correctly apply the rule for getting text content to a license element.	To pass, the value of the widget license must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-YUMJAPVEgI/000/cj.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process the text content of a license element.	To pass, the value of the widget license must be the string "PASS".',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-YUMJAPVEgI/001/ck.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("PASS");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process the text content of the license element.	To pass, the value of the widget license must be an empty string.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-YUMJAPVEgI/002/cl.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.unicode).toEqual("");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process the text content license element.	To pass, the value of the widget license must a string that corresponds to the following bytes (ASCII): 0A 09 50 0A 09 41 0A 09 53 0A 09 53 0A',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-YUMJAPVEgI/003/cz.wgt');
			proc.process(function(cfg) { 
				expect(cfg.license.ASCII).toEqual("0A 09 50 0A 09 41 0A 09 53 0A 09 53 0A");			
				done();
			});
	});
	it('Test the ability of the user agent to correctly process license element\'s href attribute when it is a file.	To pass, the value of the widget license must be an empty string, but the license href attribute must point to the file at \'test/pass.html\'.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-YUMJAPVEgI/004/cx.wgt');
			proc.process(function(cfg) { 
				expect(((cfg.license.unicode).toEqual("")) && ((cfg.license.href.unicode).toEqual("test/pass.html")));			
				done();
			});
	});
});
/*
	Test cases for ta-iipTwNshRg
*/
describe('ta-iipTwNshRg', function() {
	it('Tests the user agents ability to correctly process icon elements without a src attribute.	To pass, the icons list will only contain icon.png',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-iipTwNshRg/000/d1.wgt');
			proc.process(function(cfg) { 
				expect(((cfg.license.unicode).toEqual("")) && ((cfg.license.href.unicode).toEqual("test/pass.html")));			
				done();
			});
	});
	it('Tests the user agents ability to correctly process icon elements with an empty src attribute.	To pass, the icons list will only contain icon.png',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-iipTwNshRg/001/ga.wgt');
			proc.process(function(cfg) { 
				var firstProp;
				var iconNum;
				iconNum = cfg.icons.length;
				for(var icon in cfg.icons) {
					if(cfg.icons.hasOwnProperty(icon)) {
						firstProp = cfg.icons[icon];
					}
				}
				expect(((firstProp).toEqual("icon.png")) && ((iconNum).toEqual(1)));		
				done();
			});
	});
});
/*
	Tests for ta-roCaKRxZhS
*/
describe('ta-roCaKRxZhS', function() {
	it('Tests the UA\'s ability to handle the situation where a path points to an icon which does not exist.	To pass, the icons list must contain icon.png.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-roCaKRxZhS/000/d2.wgt');
			proc.process(function(cfg) { 
				expect(cfg.icons["icon.png"]).toBeDefined();			
				done();
			});
	});
});
/*
	Tests for ta-MFcsScFEaC
*/
describe('ta-MFcsScFEaC', function() {
	it('Test the UA\'s ability to progress to Step 8 when it has nothing to process inside the widget element.	To pass, the widget start file must be "index.htm"',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-MFcsScFEaC/000/d3.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.htm");				
				done();
			});
	});
});
/*
	Tests for ta-ignore-unrequired-feature-with-invalid-name
*/
describe('ta-ignore-unrequired-feature-with-invalid-name', function() {
	it('Tests the user agents ability to correctly process a feature element.	To pass, the user agent must not contain any values in the feature list (i.e., the erroneously named feature is ignored). ',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-ignore-unrequired-feature-with-invalid-name/000/gg.wgt');
			proc.process(function(cfg) { 
				expect(cfg.feature).toBeUndefined();				
				done();
			});
	});
});
/*
	Tests for ta-paWbGHyVrG
*/
describe('ta-paWbGHyVrG', function() {
	it('Tests the user agents ability to correctly process a feature element.	To pass, the user agent must treat this widget as an invalid widget. ',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-paWbGHyVrG/000/d4.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();				
				done();
			});
	});
});
/* 
	Test cases for ta-luyKMFABLX
*/
describe('ta-luyKMFABLX', function() {
	it('	Tests the user agents ability to correctly process a feature element.	To pass, the user agent must not contain any values in the feature list (i.e., the unknown feature is skipped). ',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-luyKMFABLX/000/d5.wgt');
			proc.process(function(cfg) { 
				expect(cfg.feature).toBeUndefined();				
				done();
			});
	});
});
/*
	Test cases for ta-xlgUWUVzCY
*/
describe('ta-xlgUWUVzCY', function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests the user agent\'s ability to correctly process a param element.	To pass, feature \'feature:a9bb79c1\' must not have any associated parameters.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-xlgUWUVzCY/000/d6.wgt');
			proc.process(function(cfg) { 
				expect(cfg.feature.feature:a9bb79c1.param).toBeUndefined();	
				done();
			});
	});
});
/*
	Test cases for ta-LTUJGJFCOU
*/
describe('ta-LTUJGJFCOU', function() {
	it('Test that the user agent skips a content element with no src attribute and	loads default start file. To pass, the start file must be index.htm at the root of the widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LTUJGJFCOU/000/d7.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.htm");			
				done();
			});
	});
	it('Test that the user agent skips a content element with no src attribute and	loads default start file.	To pass, the start file must be index.htm at the root of the widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LTUJGJFCOU/001/d8.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.htm");			
				done();
			});
	});
	it('Test that the user agent correctly handles a content element with an empty src attribute.	To pass, the start file must be index.htm at the root of the widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LTUJGJFCOU/002/gb.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.htm");			
				done();
			});
	});
});
/*
	Test cases for ta-LQcjNKBLUZ
*/
describe('ta-LQcjNKBLUZ', function() {
	it('Test that the user agent skips a content element that points to a non-existing file and shouldn\'t read the following content element.	To pass the user agent must treat the widget as invalid.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LQcjNKBLUZ/000/d9.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();			
				done();
			});
	});
	it('Test that the user agent skips a content element that points to a non-existing file.	To pass, the start file must be index.htm',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-LQcjNKBLUZ/001/d0.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.htm");			
				done();
			});
	});
});
/*
	Test cases for ta-ZjcdAxFMSx
*/
describe('ta-ZjcdAxFMSx', function() {
	it('Test the UA\'s ability to correctly find config document.	To pass, the user agent must treat this as an invalid widget (config.exe is not a recognized config file name).',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-ZjcdAxFMSx/000/dq.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();			
				done();
			});
	});
	it('Test the UA\'s ability to correctly find config document.	To pass, the user agent must treat this as an invalid widget (CoNfIG.xml is not a recognized config file name)',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-ZjcdAxFMSx/001/dw.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();			
				done();
			});
	});
});
/*
	Test cases for ta-paIabGIIMC
*/
describe('ta-paIabGIIMC', function() {
	it('Test the UA\'s support for explicitly setting the mime type of a file using the type attribute of the content element.	To pass, the widget start file must be index.php and start file content type must be "text/html"',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-paIabGIIMC/000/dc.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual("index.php");
				expect(cfg.startFile.type).toEqual("text/html");
				done();
			});
	});
	it('Test the UA\'s support for explicitly setting the mime type of a file using the type attribute of the content element.	To pass, the user agent must treat this as an invalid widget.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-paIabGIIMC/001/dv.wgt');
			proc.process(function(cfg) { 
				expect(cfg).toBeUndefined();			
				done();
			});
	});
});
/*
	Test cases for ta-rZdcMBExBX
*/
describe('ta-rZdcMBExBX', function() {
	it('	Test the UA\'s ability to handle a feature element without a name attribute.	To pass, the feature list must remain empty.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-rZdcMBExBX/000/df.wgt');
			proc.process(function(cfg) { 
				expect(cfg.features).toBeUndefined();
				done();
			});
	});
it('	NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Test the UA\'s ability to handle multiple feature elements with the same value for the name attribute, but with different param elements.	To pass, the feature list must contain two features. Both are named \'feature:a9bb79c1\'. One feature must have a parameter named "test" whose value is "pass1"	The other feature must have a parameter named "test" whose value is "pass2" (the order in which the features appear in the feature list in not relevant).
    ',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-rZdcMBExBX/002/ha.wgt');
			proc.process(function(cfg) { 
				expect(cfg.features.length).toEqual(2);
				expect(cfg.features[0].name).toEqual("feature:a9bb79c1");
				expect(cfg.features[1].name).toEqual("feature:a9bb79c1");
				expect(cfg.features[0].param.name).toEqual("test");
				expect(cfg.features[1].param.name).toEqual("test");
				if (cfg.features[0].param.value == "pass1") {
				expect(cfg.features[1].param.value).toEqual("pass2");
				}
				else {
				expect(cfg.features[0].param.value).toEqual("pass2");
				expect(cfg.features[1].param.value).toEqual("pass1");
				}//TODO -- This seems a very messy way of solving this.
				done();
			});
	});

});
/*
	Test cases for ta-EGkPfzCBOz
*/
describe('ta-EGkPfzCBOz', function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests the user agents to correctly handle a param element with missing name attribute.	To pass, the feature list must contain one feature named \'feature:a9bb79c1\' with no associated parameters.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-EGkPfzCBOz/000/dt.wgt');
			proc.process(function(cfg) { 
				expect(cfg.features.length).toEqual(1);
				expect('feature:a9bb79c1' in cfg.features).toBeTruthy();
				expect(cfg.features[0].param).toBeUndefined();
				done();
			});
	});
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.Tests the user agents to correctly handle a param element with missing name attribute.	To pass, the feature list must contain one feature named \'feature:a9bb79c1\' with one associated parameter whose name	is \'PASS\' and whose value is \'PASS\'.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-EGkPfzCBOz/001/dg.wgt');
			proc.process(function(cfg) { 
				expect(cfg.features.length).toEqual(1);
				expect('feature:a9bb79c1' in cfg.features).toBeTruthy();
				expect(cfg.features[0].param.name).toEqual('PASS');
				expect(cfg.features[0].param.value).toEqual('PASS');
				done();
			});
	});
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.Tests the user agents to correctly handle param elements that have the same value for the name attribute.	To pass, the feature list must contain one feature named \'feature:a9bb79c1\' with two associated parameters whose name	is \'PASS\' and whose value are \'value1\' and \'value2\'.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-EGkPfzCBOz/002/v9.wgt');
			proc.process(function(cfg) { 
				expect(cfg.features.length).toEqual(1);
				expect('feature:a9bb79c1' in cfg.features).toBeTruthy();
				expect(cfg.features.param.length).toEqual(2);
				expect(cfg.features.param[0].name).toEqual('PASS');
				expect(cfg.features.param[1].name).toEqual('PASS');
				if (cfg.features.param[0].value == 'value1') {
				expect(cfg.features.param[1].value).toEqual('value2');
				}
				else {
				expect(cfg.features.param[0].value).toEqual('value2');
				expect(cfg.features.param[1].value).toEqual('value1');//TODO -- I'm sure this could be done better, same as the other function.
				}
				done();
			});
	});
});
/*
	Test cases for ta-pIffQywZin
*/
	
describe('ta-pIffQywZin', function() {
it('Test that the user agent skip a content element that uses an invalid path.	To pass, the start file must be index.htm at the root of the widget package.',
		function(done) {
			var proc = new WidgetTestProcessor('/ta-pIffQywZin/000/db.wgt');
			proc.process(function(cfg) { 
				expect(cfg.startFile.path).toEqual('index.htm');
				done();
			});
	});
});
    
}());
describe('ta-pIffQywZin',function() {
	it('Test that the user agent skip a content element that uses an invalid path.	To pass, the start file must be index.htm at the root of the widget package.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-pIffQywZin/000/db.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual('index.htm');
				done();
			});
	});
});
describe('ta-FDGQBROtzW',function() {
	it('[optional test!] Tests the user agent\'s ability to process files with a file extension other than .wgt.	To pass, the user agent start file of the widget must be index.htm',
		function (done) {
			var proc = new WidgetTestProcessor('ta-FDGQBROtzW/000/dn.test');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual('index.htm');
				done();
			});
	});
	it('Tests the user agent\'s ability to process files with no file extension.	To pass, the user agent start file of the widget must be index.htm',
		function (done) {
			var proc = new WidgetTestProcessor('ta-FDGQBROtzW/001/dm');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual('index.htm'); 
				done();
			});
	});
});
describe('ta-qxLSCRCHlN',function() {
	it('[optional] Test the ability to deal with a widget with a wrong magic number.	To pass, the user agent must treat this as an invalid widget.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-qxLSCRCHlN/000/dk.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
});
describe('ta-uLHyIMvLwz',function() {
	it('Test the ability of the UA to verify a zip archive.	To pass, the user agent must treat this as an invalid widget (archive is encrypted - password is test).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-uLHyIMvLwz/000/dl.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('Test the ability of the UA to verify a zip archive.	To pass, the user agent must treat this as an invalid widget (archive is spanned).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-uLHyIMvLwz/001/split.wgt.001');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
	it('Test the ability of the UA to verify a zip archive.	To pass, the user agent must treat this as an invalid widget (archive is empty).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-uLHyIMvLwz/002/dp.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
});
describe('ta-KNiLPOKdgQ',function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests the user agents ability to ignore orphan param elements.	To pass, the feature feature:a9bb79c1 must not have any params associated with it.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-KNiLPOKdgQ/000/e1.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1.param).toBeUndefined(); //TODO -- unsure.
				done();
			});
	});
});
describe('ta-CEGwkNQcWo',function() {
	it('Test that a user agent correctly ignores param elements with empty name attributes.	To pass, the feature feature:a9bb79c1 must not have any associated params.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-CEGwkNQcWo/000/e2.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1.param).toBeUndefined(); //TODO -- unsure.
				done();
			});
	});
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Test that a user agent correctly applies the rule for getting a single attribute value to a param element\'s name and value attributes.	To pass, the feature feature:a9bb79c1 must not have any associated params.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-CEGwkNQcWo/001/e3.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1.param).toBeUndefined(); //TODO -- unsure.
				done();
			});
	});
});
describe('ta-dPOgiLQKNK',function() {
	it('Tests the user agent\'s ability to correctly process a content element\'s encoding attribute when it is empty.	To pass, the value of the start file encoding must be UTF-8.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-dPOgiLQKNK/000/e4.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.encoding).toEqual("UTF-8"); 
				done();
			});
	});
	it('This test is optional as user agents are not required to support ISO-8859-1. 	Tests the user agent\'s ability to correctly process a content element\'s encoding attribute when it contains the value "ISO-8859-1".	To pass, the value of the start file encoding must be ISO-8859-1.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-dPOgiLQKNK/001/e5.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.encoding).toEqual("ISO-8859-1"); //TODO -- should be right but not entirely sure. Do we have to specify the start file name?
				done();
			});
	});
	it('This test is optional as user agents are not required to support ISO-8859-1. 	Test that a user agent correctly applies the rule for getting a single attribute value to the content element\'s encoding attribute.	To pass, the value of the start file encoding must be ISO-8859-1.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-dPOgiLQKNK/002/e6.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.encoding).toEqual("ISO-8859-1"); //TODO -- should be right but not entirely sure. Do we have to specify the start file name?
				done();
			});
	});
	it('Tests the user agent\'s ability to correctly process a content element\'s encoding attribute when it encounters a bogus encoding name.	To pass, the value of the start file encoding must be UTF-8.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-dPOgiLQKNK/003/e7.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.encoding).toEqual("UTF-8"); 
				done();
			});
	});
});
describe('ta-vOBaOcWfll',function() {
	it('Tests the ability of the user agent to correctly handle required a feature when the feature is not supported by the UA.	To pass, the UA must treat this as an invalid widget.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-vOBaOcWfll/000/e8.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined();
				done();
			});
	});
});
describe('ta-bbbbbbbbbb',function() {
	it('Tests the ability of the user agent to correctly ignore unknown elements.	To pass, the UA must use pass.html as the start file.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-bbbbbbbbbb/000/xx.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual("pass.html");
				done();
			});
	});
});
describe('ta-iuJHnskSHq',function() {
	it('Tests the ability of the user agent to correctly deal with an icon element	that points to a file that is not present in the widget package.	To pass, the icon list must be empty.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-iuJHnskSHq/000/zz.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons.length).toEqual(0);
				done();
			});
	});
	it('Test the UAs ability to ignore un-processable files as an icon format (fail contains garbage data).	To pass, the user agent must behave as if "pass.png" is the only icon in the icons	list.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-iuJHnskSHq/001/za.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons.length).toEqual(1);
				expect("pass.png" in cfg.icons).toBeTruthy();
				done();
			});
	});
	it('Test the UAs ability to ignore subsequent declarations to use the same icon.	To pass, the user agent must contain "locales/en/custom.png"  	(or "custom.png" depending on the default locale of the user agent) in the icons list and the icon must not have an associated width or height (unless it has been computed from the file).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-iuJHnskSHq/003/zc.wgt');
			proc.process(function(cfg) {
				expect("locales/en/custom.png" in cfg.icons).toBeTruthy();
				expect(cfg.icons["locales/en/custom.png"].height).toBeUndefined();
				expect(cfg.icons["locales/en/custom.png"].width).toBeUndefined();//TODO -- how to check if this has computed height and width.
				done();
			});
	});
});
describe('ta-eHUaPbgfKg',function() {
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be the value "123".',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/000/ix.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toEqual(123);
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the user agent must ignore the value of the icon\'s height attribute (the value is composed of characters).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/001/iy.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be the numeric value 100 (resulting from rule for parsing a non-negative integer).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/002/iz.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toEqual(100);
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be the numeric value 123 (resulting from rule for parsing a non-negative integer).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/003/i1.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toEqual(123);
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be ignored (the value is an empty string, hence it would be ignored).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/004/i2.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the icon\'s height must be ignored (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/005/i3.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the height attribute of an icon.	To pass, the value of the height attribute must be ignored (it is less than zero).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-eHUaPbgfKg/006/i4.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].height).toBeUndefined();
				done();
			});
	});
});
describe('ta-nYAcofihvj',function() {
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be the value "123".',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/000/iq.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toEqual(123);
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored (the value is composed of characters).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/001/i9.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be the numeric value 100 (resulting from rule for parsing a non-negative integer).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/002/iw.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toEqual(100);
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be the numeric value 123 (resulting from rule for parsing a non-negative integer).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/003/ie.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toEqual(123);
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored (the value is an empty string, hence it would be ignored).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/004/ir.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored (the value is a sequence of space characters, hence it would be ignored).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/005/it.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toBeUndefined();
				done();
			});
	});
	it('Test the UA\'s ability process the width attribute of an icon element.	To pass, the icon\'s width must be ignored.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-nYAcofihvj/006/ib.wgt');
			proc.process(function(cfg) {
				expect(cfg.icons["icon/icon.png"].width).toBeUndefined();
				done();
			});
	});
});
describe('ta-aaaaaaaaaa',function() {
	it('This test is optional as user agents are not required to support ISO-8859-1. 	Test that the user agent correctly handles a charset parameter when the type attribute is present.	To pass, the user agent must sets the start file encoding to \'ISO-8859-1\' and ignore the charset parameter used in the type attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-aaaaaaaaaa/000/z1.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.encoding).toEqual("ISO-8859-1");
				done();
			});
	});
	it('This test is optional as user agents are not required to support Windows-1252. 	Test that the user agent sets the user agent can derive the start file encoding from the charset parameter in the type attribute.	To pass, the start file encoding must be \'Windows-1252\'.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-aaaaaaaaaa/001/z2.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.encoding).toEqual("Windows-1252");
				done();
			});
	});
});
describe('ta-GVVIvsdEUo',function() {
	it('Test the user agent\'s ability to get a widget over HTTP and respect the application/widget mimetype. The server from which this test is served from has been set up to label the \'test\' resource as an \'application/widget\'.	To pass, a user agent must correctly process this resource as a widget because of the \'application/widget\' mimetype (i.e., not only because of sniffing).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-GVVIvsdEUo/000/z3');
			proc.process(function(cfg) {
				expect(cfg).toBeDefined(); //TODO -- Needs looking at later
				done();
			});
	});
	it('Test the user agent\'s ability to get a widget over HTTP and respect the \'application/widget\' mimetype. The server from which this test is served from has been set up to label the \'test.html\' resource as an \'application/widget\'.	To pass, a user agent must correctly process this resource as a widget because of the \'application/widget\' mimetype (i.e., not only via sniffing).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-GVVIvsdEUo/001/z4.html');
			proc.process(function(cfg) {
				expect(cfg).toBeDefined(); //TODO -- Needs looking at later
				done();
			});
	});
	it('Test the user agent\'s ability handle a widget served with a bogus mime type. The server from which this test is served from has been set up to label the \'a5.wgt\' resource as an \'x-xDvaDFadAF/x-adfsdADfda\'. To pass, a user agent must must treat the resource as invalid  (the mime type is bogus).',
		function (done) {
			var proc = new WidgetTestProcessor('ta-GVVIvsdEUo/002/z5.wgt');
			proc.process(function(cfg) {
				expect(cfg).toBeUndefined(); //TODO -- Needs looking at later
				done();
			});
	});
});
describe('ta-viewmodes',function() {
	it('Test the UA\'s ability process the various values applicable to viewmodes attribute of the widget element. To pass, the viewmodes list should contain a single value "floating" and/or "maximized" if the UA supports this else empty.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-viewmodes/001/viewb.wgt');
			proc.process(function(cfg) {
				if (cfg.viewModes.length == 1) {
				expect("floating" || "maximized" in cfg.viewModes).toBeTruthy();;
				}
				else {
				expect(cfg.viewModes.length).toEqual(0);
				}
				done();
			});
	});
	it('Test the UA\'s ability process a viewmodes attribute containing an unsupported value.	To pass, the viewmodes list should be empty.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-viewmodes/005/viewf.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes.length).toEqual(0);
				done();
			});
	});
	it('Test the UA\'s ability process a viewmodes attribute containing multiple supported values.	To pass, the viewmodes list should be "windowed floating maximized" if the UA supports all of these.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-viewmodes/006/viewg.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes[0]).toEqual("windowed"); //TODO -- How to check if the UA supports all of these modes, if it doesn't then 
				expect(cfg.viewModes[1]).toEqual("floating"); // not all of them will appear. Also should the length of viewModes be checked?
				expect(cfg.viewModes[2]).toEqual("maximized");
				done();
			});
	});
	it('Test the UA\'s ability process a viewmodes attribute containing supported and unsupported values.	To pass, the viewmodes list should be "floating windowed maximized" if the UA supports all of these.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-viewmodes/007/viewh.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes[0]).toEqual("floating"); //TODO -- How to check if the UA supports all of these modes, if it doesn't then 
				expect(cfg.viewModes[1]).toEqual("windowed"); // not all of them will appear. Also should the length of viewModes be checked?
				expect(cfg.viewModes[2]).toEqual("maximized");
				done();
			});
	});
	it('Test the UA\'s ability process an empty viewmodes attribute of the widget element.	To pass, the viewmodes list should be empty.',
		function (done) {
			var proc = new WidgetTestProcessor('ta-viewmodes/008/viewi.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes.length).toEqual(0);
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that LRO direction applies to the name element.	To pass, the displayed value of the name element must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/001/i18nlro01.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LRO direction applies to the name element\'s short attribute.	To pass, the displayed value of the short attribute must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/002/i18nlro02.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that LRO direction applies to the description element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/003/i18nlro03.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LRO direction applies to the author element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/004/i18nlro04.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LRO direction applies to the license element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/005/i18nlro05.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that LRO direction applies to the span element within the name element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/006/i18nlro06.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that LRO direction applies to the span element within the description element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/007/i18nlro07.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LRO direction applies to the span element within the author element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/008/i18nlro08.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LRO direction applies to the span element within the license element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/009/i18nlro09.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested LRO and RLO directions applies within the name element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/010/i18nlro10.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that nested LRO and RLO directions applies within the description element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/011/i18nlro11.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that nested LRO and RLO directions applies within the author element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/012/i18nlro12.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that nested LRO and RLO directions applies within the license element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/013/i18nlro13.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that LRO direction is inherited by the name element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/014/i18nlro14.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LRO direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/015/i18nlro15.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that LRO direction is inherited by the description element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/016/i18nlro16.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LRO direction is inherited by the author element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/017/i18nlro17.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LRO direction is inherited by the license element from the widget element.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/018/i18nlro18.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested LRO and LTR directions apply correctly to the name element.	To pass, the displayed value of the name element must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/019/i18nlro19.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested LRO and RTL directions apply correctly to the name element.	To pass, the displayed value of the name element must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/020/i18nlro20.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested LRO and LRO directions apply correctly to the name element.	To pass, the displayed value of the name element must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/021/i18nlro21.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested LRO and RLO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/022/i18nlro22.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-roCaKRxZhS',function() {
	it('Tests that LRO direction does not apply to the icon element\'s src attribute.	To pass, the user agent must select test.png as an icon (and not \'gnp.tset\').',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/023/i18nlro23.wgt');
			proc.process(function(cfg) {
				expect("test.png" in cfg.icons).toBeTruthy();
				expect(cfg.icons.length).toEqual(0);
				done();
			});
	});
});
describe('ta-LQcjNKBLUZ',function() {
	it('Tests that LRO direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/026/i18nlro26.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual("pass.htm");
				done();
			});
	});
});
describe('ta-paIabGIIMC',function() {
	it('Tests that LRO direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/027/i18nlro27.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.type).toEqual("text/html");
				done();
			});
	});
});
describe('ta-dPOgiLQKNK',function() {
	it('Tests that LRO direction does not apply to the content element\'s encoding attribute.	To pass, the content element\'s encoding attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/028/i18nlro28.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.encoding).toEqual("iso-8859-1");
				done();
			});
	});
});
describe('ta-rZdcMBExBX',function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that LRO direction does not apply to the feature element\'s name attribute.	To pass, the value of the attribute must remain "feature:a9bb79c1".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/029/i18nlro29.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1).toBeDefined(); //TODO -- Unsure on this one.
				done();
			});
	});
	it('Tests that LRO direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/030/i18nlro30.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.require).toBeFalsy();
				done();
			});
	});
});
describe('ta-CEGwkNQcWo',function() {
	it('Tests that LRO direction does not apply to the param element\'s name attribute.	To pass, the value of the param element\'s name attribute must remain "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/031/i18nlro31.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1.param.name).toEqual("??????");
				done();
			});
	});
	it('Tests that LRO direction does not apply to the param element\'s value attribute.	To pass, the param element\'s name attribute must remain "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/032/i18nlro32.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1.param.value).toEqual("??????"); //TODO -- Is test spec wrong? should be checking for value here not param name as it says above.
				done();
			});
	});
});
describe('ta-DwhJBIJRQN',function() {
	it('Tests that LRO direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/033/i18nlro33.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LRO direction does not apply to the preference element\'s value attribute.	To pass, the value must be "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/034/i18nlro34.wgt');
			proc.process(function(cfg) {
				expect(cfg.preference.value).toEqual("??????");
				done();
			});
	});
	it('Tests that LRO direction does not apply to the preference element\'s readonly attribute.	To pass, the value must be "true".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/035/i18nlro35.wgt');
			proc.process(function(cfg) {
				expect(cfg.preferences.readonly).toBeTruthy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LRO direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/036/i18nlro36.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LRO direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/037/i18nlro37.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LRO direction does not apply to the license element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/038/i18nlro38.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-UScJfQHPPy',function() {
	it('Tests that LRO direction does not apply to the widget element\'s width attribute.	To pass, the widget element\'s width attribute must be "123" or a value greater than 0',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/039/i18nlro39.wgt');
			proc.process(function(cfg) {
				expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0);
				done();
			});
	});
});
describe('ta-BxjoiWHaMr',function() {
	it('Tests that LRO direction does not apply to the widget element\'s height attribute.	To pass, the widget element\'s height attribute must be "123" or a value greater than 0',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/040/i18nlro40.wgt');
			proc.process(function(cfg) {
				expect(cfg.height).toEqual(123) || expect(cfg.height).toBeGreaterThan(0);
				done();
			});
	});
});
describe('ta-RawAIWHoMs',function() {
	it('Tests that LRO direction does not apply to the widget element\'s id attribute.	To pass, the id attribute must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/041/i18nlro41.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-viewmodes',function() {
	it('Tests that LRO direction does not apply to the widget element\'s viewmodes attribute.	To pass, the widget needs to be put into one of the following view modes (if supported) "maximized floating".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/043/i18nlro43.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewMode).toEqual("maximized" || "floating");
				done();
			});
	});
});
describe('ta-klLDaEgJeU',function() {
	it('Tests that LRO direction does not apply to the widget element\'s xml:lang attribute.	To pass, the displayed value must render as "en".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/044/i18nlro44.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that LTR direction applies to the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/001/i18nltr01.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction applies to the name element\'s short attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/002/i18nltr02.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that LTR direction applies to the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/003/i18nltr03.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LTR direction applies to the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/004/i18nltr04.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LTR direction applies to the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/005/i18nltr05.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that LTR direction applies to the span element within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/006/i18nltr06.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that LTR direction applies to the span element within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/007/i18nltr07.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LTR direction applies to the span element within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/008/i18nltr08.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LTR direction applies to the span element within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/009/i18nltr09.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested LTR and RTL directions applies within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/010/i18nltr10.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that nested LTR and RTL directions applies within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/011/i18nltr11.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that nested LTR and RTL directions applies within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/012/i18nltr12.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that nested LTR and RTL directions applies within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/013/i18nltr13.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that LTR direction is inherited by the name element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/014/i18nltr14.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/015/i18nltr15.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that LTR direction is inherited by the description element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/016/i18nltr16.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LTR direction is inherited by the author element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/017/i18nltr17.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LTR direction is inherited by the license element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/018/i18nltr18.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested LTR directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/019/i18nltr19.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested LTR and RTL directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/020/i18nltr20.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested LTR and LRO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/021/i18nltr21.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested LTR and RLO directions apply correctly.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/022/i18nltr22.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-roCaKRxZhS',function() {
	it('Tests that LTR direction does not apply to the icon element\'s src attribute.	To pass, the user agent must select test.png as an icon (and not \'gnp.tset\').',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/023/i18nltr23.wgt');
			proc.process(function(cfg) {
				expect("test.png" in cfg.icons).toBeTruthy();
				expect(cfg.icons.length).toEqual(1);
				done();
			});
	});
});
describe('ta-LQcjNKBLUZ',function() {
	it('Tests that LTR direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/026/i18nltr26.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual("pass.htm");
				done();
			});
	});
});
describe('ta-paIabGIIMC',function() {
	it('Tests that LTR direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/027/i18nltr27.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.type).toEqual("text/html");
				done();
			});
	});
});
describe('ta-dPOgiLQKNK',function() {
	it('Tests that LTR direction does not apply to the content element\'s encoding attribute.	To pass, the content element\'s encoding attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/028/i18nltr28.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.encoding).toEqual("iso-8859-1");
				done();
			});
	});
});
describe('ta-rZdcMBExBX',function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that LTR direction does not apply to the feature element\'s name attribute.	To pass, the displayed value must be treated as "feature:a9bb79c1".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/029/i18nltr29.wgt');
			proc.process(function(cfg) {
				expect("feature.a9bb79c1" in cfg.feature).toBeTruthy();
				done();
			});
	});
	it('Tests that LTR direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/030/i18nltr30.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.required).toBeFalsy();
				done();
			});
	});
});
describe('ta-CEGwkNQcWo',function() {
	it('Tests that LTR direction does not apply to the param element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/031/i18nltr31.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction does not apply to the param element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/032/i18nltr32.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-DwhJBIJRQN',function() {
	it('Tests that LTR direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/033/i18nltr33.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction does not apply to the preference element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/034/i18nltr34.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction does not apply to the preference element\'s readonly attribute.	To pass, the value must treated as "true".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/035/i18nltr35.wgt');
			proc.process(function(cfg) {
				expect(cfg.preference.readonly).toBeTruthy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that LTR direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/036/i18nltr36.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/037/i18nltr37.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that LTR direction does not apply to the license element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/038/i18nltr38.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-UScJfQHPPy',function() {
	it('Tests that LTR direction does not apply to the widget element\'s width attribute.	To pass, the width of the widget value must be "123" or a value greater than 0.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/039/i18nltr39.wgt');
			proc.process(function(cfg) {
				expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0);
				done();
			});
	});
});
describe('ta-BxjoiWHaMr',function() {
	it('Tests that LTR direction does not apply to the widget element\'s height attribute.	To pass, the height of the widget must be "123" or a value greater than 0.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/040/i18nltr40.wgt');
			proc.process(function(cfg) {
				expect(cfg.height).toEqual(123) || expect(cfg.height).toBeGreaterThan(0);
				done();
			});
	});
});
describe('ta-RawAIWHoMs',function() {
	it('Tests that LTR direction does not apply to the widget element\'s id attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/041/i18nltr41.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-viewmodes',function() {
	it('Tests that LTR direction does not apply to the widget element\'s viewmodes attribute.	To pass, the use agent must start in one of the following view modes (if supported) "windowed floating maximized".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/043/i18nltr43.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes).toEqual("windowed" || "floating" || "maximized"); //TODO -- Unsure of this, how do you know which mode is active, or should you just check if one of the values is in the list viewMOode
				done();
			});
	});
});
describe('ta-klLDaEgJeU',function() {
	it('Tests that LTR direction does not apply to the widget element\'s xml:lang attribute.	To pass, the displayed value must render as "en".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/044/i18nltr44.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that RLO direction applies to the name element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/001/i18nrlo01.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction applies to the name element\'s short attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/002/i18nrlo02.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that RLO direction applies to the description element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/003/i18nrlo03.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RLO direction applies to the author element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/004/i18nrlo04.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RLO direction applies to the license element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/005/i18nrlo05.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that RLO direction applies to the span element within the name element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/006/i18nrlo06.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that RLO direction applies to the span element within the description element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/007/i18nrlo07.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RLO direction applies to the span element within the author element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/008/i18nrlo08.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RLO direction applies to the span element within the license element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/009/i18nrlo09.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested RLO and LRO directions applies within the name element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/010/i18nrlo10.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that nested RLO and LRO directions applies within the description element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/011/i18nrlo11.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that nested RLO and LRO directions applies within the author element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/012/i18nrlo12.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that nested RLO and LRO directions applies within the license element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/013/i18nrlo13.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that RLO direction is inherited by the name element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/014/i18nrlo14.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/015/i18nrlo15.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that RLO direction is inherited by the description element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/016/i18nrlo16.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RLO direction is inherited by the author element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/017/i18nrlo17.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RLO direction is inherited by the license element from the widget element.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/018/i18nrlo18.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested RLO and LTR directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/019/i18nrlo19.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested RLO and RTL directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/020/i18nrlo20.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested RLO and LRO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/021/i18nrlo21.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested RLO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/022/i18nrlo22.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-roCaKRxZhS',function() {
	it('Tests that RLO direction does not apply to the icon element\'s src attribute.	To pass, the icon must be "test.png".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/023/i18nrlo23.wgt');
			proc.process(function(cfg) {
				expect("test.png" in cfg.icons).toBeTruthy();
				expect(cfg.icons.length).toEqual(1);
				done();
			});
	});
});
describe('ta-LQcjNKBLUZ',function() {
	it('Tests that RLO direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/026/i18nrlo26.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual("pass.htm");
				done();
			});
	});
});
describe('ta-paIabGIIMC',function() {
	it('Tests that RLO direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/027/i18nrlo27.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.type).toEqual("text/html");
				done();
			});
	});
});
describe('ta-dPOgiLQKNK',function() {
	it('Tests that RLO direction does not apply to the content element\'s encoding attribute.	To pass, the displayed value must remain as "ISO-8859-1".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/028/i18nrlo28.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.encoding).toEqual("ISO-8859-1");
				done();
			});
	});
});
describe('ta-rZdcMBExBX',function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that RLO direction does not apply to the feature element\'s name attribute.	To pass, the user agent needs to treat the feature "feature:a9bb79c1" as supported.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/029/i18nrlo29.wgt');
			proc.process(function(cfg) {
				expect(FeatureSupport.isSupported(feature:a9bb79c1)).toBeTruthy(); //TODO -- I think this could be wrong, however the function seems to be exactly what we need. it's in featuresupport.js
				done();
			});
	});
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that RLO direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/030/i18nrlo30.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.feature:a9bb79c1.required).toBeFalsy();
				done();
			});
	});
});
describe('ta-CEGwkNQcWo',function() {
	it('Tests that RLO direction does not apply to the param element\'s name attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/031/i18nrlo31.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction does not apply to the param element\'s value attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/032/i18nrlo32.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-DwhJBIJRQN',function() {
	it('Tests that RLO direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/033/i18nrlo33.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction does not apply to the preference element\'s value attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/034/i18nrlo34.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction does not apply to the preference element\'s readonly attribute.	To pass, the value must be treated as "true".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/035/i18nrlo35.wgt');
			proc.process(function(cfg) {
				expect(cfg.preference.readonly).toBeTruthy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RLO direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/036/i18nrlo36.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/037/i18nrlo37.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RLO direction does not apply to the license element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/038/i18nrlo38.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-UScJfQHPPy',function() {
	it('Tests that RLO direction does not apply to the widget element\'s width attribute.	To pass, the width of the widget must be "123" or a value greater than 0.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/039/i18nrlo39.wgt');
			proc.process(function(cfg) {
				expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0);
				done();
			});
	});
});
describe('ta-BxjoiWHaMr',function() {
	it('Tests that RLO direction does not apply to the widget element\'s height attribute.	To pass, the height of the widget must be "123" or a value greater than 0.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/040/i18nrlo40.wgt');
			proc.process(function(cfg) {
				expect(cfg.height).toEqual(123) || expect(cfg.height).toBeGreaterThan(0); 
				done();
			});
	});
});
describe('ta-RawAIWHoMs',function() {
	it('Tests that RLO direction does not apply to the widget element\'s id attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/041/i18nrlo41.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-viewmodes',function() {
	it('Tests that RTL direction does not apply to the widget element\'s viewmodes attribute.	To pass, viewmodes must be one of "maximized, floating, windowed" (if supported).',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/043/i18nrtl43.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes).toEqual("maximized" || "floating" || "windowed");
				done();
			});
	});
});
describe('ta-klLDaEgJeU',function() {
	it('Tests that RTL direction does not apply to the widget element\'s xml:lang attribute.	To pass, the widget element\'s xml:lang attribute must remain as "en".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/044/i18nrtl44.wgt');
			proc.process(function(cfg) {
				expect(cfg.xml:lang).toEqual("en");
				done();
			});
	});
});
describe('ta-viewmodes',function() {
	it('Tests that RLO direction does not apply to the widget element\'s viewmodes attribute.	To pass, the widget needs to be in one of the following view modes (if supported) "windowed floating maximized".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/043/i18nrlo43.wgt');
			proc.process(function(cfg) {
				expect(cfg.viewModes).toEqual("maximized" || "floating" || "windowed"); //TODO -- Is there a way of finding current view mode, e.g. viewModes.active?
				done();
			});
	});
});
describe('ta-klLDaEgJeU',function() {
	it('Tests that RLO direction does not apply to the widget element\'s xml:lang attribute.	To pass, the displayed value must render as "en".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/044/i18nrlo44.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that RTL direction applies to the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/001/i18nrtl01.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction applies to the name element\'s short attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/002/i18nrtl02.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that RTL direction applies to the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/003/i18nrtl03.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RTL direction applies to the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/004/i18nrtl04.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RTL direction applies to the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/005/i18nrtl05.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that RTL direction applies to the span element within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/006/i18nrtl06.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that RTL direction applies to the span element within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/007/i18nrtl07.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RTL direction applies to the span element within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/008/i18nrtl08.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RTL direction applies to the span element within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/009/i18nrtl09.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested RTL and RTL directions applies within the name element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/010/i18nrtl10.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that nested RTL and RTL directions applies within the description element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/011/i18nrtl11.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that nested RTL and RTL directions applies within the author element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/012/i18nrtl12.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that nested RTL and RTL directions applies within the license element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/013/i18nrtl13.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that RTL direction is inherited by the name element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/014/i18nrtl14.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction is inherited by the name element\'s short attribute from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/015/i18nrtl15.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-VdCEyDVSA',function() {
	it('Tests that RTL direction is inherited by the description element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/016/i18nrtl16.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RTL direction is inherited by the author element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/017/i18nrtl17.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RTL direction is inherited by the license element from the widget element.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/018/i18nrtl18.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-AYLMhryBnD',function() {
	it('Tests that nested RTL and LTR directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/019/i18nrtl19.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested RTL directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/020/i18nrtl20.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested RTL and LRO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/021/i18nrtl21.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that nested RTL and RLO directions apply correctly to the name element.	To pass, the displayed value must render as "< PASSED -->".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/022/i18nrtl22.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-roCaKRxZhS',function() {
	it('Tests that RTL direction does not apply to the icon element\'s src attribute.	To pass, the user agent must select test.png as an icon (and not \'gnp.tset\').',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/023/i18nrtl23.wgt');
			proc.process(function(cfg) {
				expect("test.png" in cfg.icons).toBeTruthy();
				expect(cfg.icons.length).toEqual(1);
				done();
			});
	});
});
describe('ta-LQcjNKBLUZ',function() {
	it('Tests that RTL direction does not apply to the content element\'s src attribute.	To pass, the start page must be "pass.htm".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/026/i18nrtl26.wgt');
			proc.process(function(cfg) {
				expect(cfg.startFile.path).toEqual("pass.htm");
				done();
			});
	});
});
describe('ta-paIabGIIMC',function() {
	it('Tests that RTL direction does not apply to the content element\'s type attribute.	To pass, the content element\'s type attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/027/i18nrtl27.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.type).toEqual("text/html");
				done();
			});
	});
});
describe('ta-dPOgiLQKNK',function() {
	it('Tests that RTL direction does not apply to the content element\'s encoding attribute.	To pass, the content element\'s encoding attribute must be unaffected by the presence of the dir attribute.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/028/i18nrtl28.wgt');
			proc.process(function(cfg) {
				expect(cfg.content.encoding).toEqual("iso-8859-1");
				done();
			});
	});
});
describe('ta-rZdcMBExBX',function() {
	it('NOTE: this test assumes the widget engine supports the magic feature "feature:a9bb79c1". This feature does nothing: it\'s just used for conformance testing.	Tests that RTL direction does not apply to the feature element\'s name attribute.	To pass, the displayed value must render as "feature:a9bb79c1".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/029/i18nrtl29.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction does not apply to the feature element\'s required attribute.	To pass, the value of the required attribute must be treated as "false".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/030/i18nrtl30.wgt');
			proc.process(function(cfg) {
				expect(cfg.feature.required).toBeFalsy();
				done();
			});
	});
});
describe('ta-CEGwkNQcWo',function() {
	it('Tests that RTL direction does not apply to the param element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/031/i18nrtl31.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction does not apply to the param element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/032/i18nrtl32.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-DwhJBIJRQN',function() {
	it('Tests that RTL direction does not apply to the preference element\'s name attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/033/i18nrtl33.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction does not apply to the preference element\'s value attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/034/i18nrtl34.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction does not apply to the preference element\'s readonly attribute.	To pass, the value must render as "true".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/035/i18nrtl35.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-argMozRiC',function() {
	it('Tests that RTL direction does not apply to the author element\'s href attribute.	To pass, the displayed value must render as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/036/i18nrtl36.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction does not apply to the author element\'s email attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/037/i18nrtl37.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
describe('ta-YUMJAPVEgI',function() {
	it('Tests that RTL direction does not apply to the license element\'s href attribute.	To pass, the license element\'s href attribute must remain as "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/038/i18nrtl38.wgt');
			proc.process(function(cfg) {
				expect(cfg.license.href).toEqual("http://widget.example.org/");
				done();
			});
	});
});
describe('ta-UScJfQHPPy',function() {
	it('Tests that RTL direction does not apply to the widget element\'s width attribute.	To pass, the widget element\'s width attribute must be "123" or a value greater than 0.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/039/i18nrtl39.wgt');
			proc.process(function(cfg) {
				expect(cfg.width).toEqual(123) || expect(cfg.width).toBeGreaterThan(0); 
				done();
			});
	});
});
describe('ta-BxjoiWHaMr',function() {
	it('Tests that RTL direction does not apply to the widget element\'s height attribute.	To pass, the widget element\'s height attribute must remain as "123" or a value greater than 0.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/040/i18nrtl40.wgt');
			proc.process(function(cfg) {
				expect(cfg.height).toEqual(123) || expect(cfg.height).toBeGreaterThan(0); 
				done();
			});
	});
});
describe('ta-RawAIWHoMs',function() {
	it('Tests that RTL direction does not apply to the widget element\'s id attribute.	To pass, the widget element\'s id attribute value must be "http://widget.example.org/".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/041/i18nrtl41.wgt');
			proc.process(function(cfg) {
				expect(cfg.id).toEqual("http://widget.example.org/");
				done();
			});
	});
});
describe('ta-VerEfVGeTc',function() {
	it('Tests that LRO direction applies to the widget element\'s version attribute.	To pass, the displayed value must render as "??????".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-lro/042/i18nlro42.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that LTR direction applies to the widget element\'s version attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-ltr/042/i18nltr42.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RLO direction applies to the widget element\'s version attribute.	To pass, the displayed value must render as "PASSED".',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rlo/042/i18nrlo42.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
	it('Tests that RTL direction applies to the widget element\'s version attribute.	To pass, the displayed value must render the arrow pointing to the right.',
		function (done) {
			var proc = new WidgetTestProcessor('i18n-rtl/042/i18nrtl42.wgt');
			proc.process(function(cfg) {
				expect(true).toBeFalsy();
				done();
			});
	});
});
