/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Ivan Glautier, Nquiring Minds
 ******************************************************************************/

describe ( "api.sensors", function () {

	var sensorService;
	var boundSensorService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/sensors.temperature"), {
			onFound: function (service) {
				sensorService = service;
				sensorService.bindService({onBind: function(service) {
					boundSensorService = service;
				}});
			}
		});

		waitsFor(function() {
			return !!sensorService;
		}, "The discovery didn't find a temperature sensor service", 5000);

		waitsFor(function() {
			return !!boundSensorService;
		}, "The found temperature sensor service service couldn't be bound", 5000);


	});
	it("should be available from the discovery", function() {
		expect(sensorService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(sensorService).toHaveProp("api");
		expect(sensorService.api).toEqual(jasmine.any(String));

		expect(sensorService).toHaveProp("type");
		expect(sensorService.type).toEqual(jasmine.any(String));

		expect(sensorService).toHaveProp("maximumRange");
		expect(sensorService.maximumRange).toEqual(jasmine.any(Number));

		expect(sensorService).toHaveProp("resolution");
		expect(sensorService.resolution).toEqual(jasmine.any(Number));

		expect(sensorService).toHaveProp("minDelay");
		expect(sensorService.minDelay).toEqual(jasmine.any(Number));

		expect(sensorService).toHaveProp("power");
		expect(sensorService.power).toEqual(jasmine.any(Number));

		expect(sensorService).toHaveProp("vendor");
		expect(sensorService.vendor).toEqual(jasmine.any(String));

		expect(sensorService).toHaveProp("version");
		expect(sensorService.version).toEqual(jasmine.any(Number));

		expect(sensorService).toHaveProp("bindService");
		expect(sensorService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		sensorService.bindService({onBind: function(service) {
			sensorService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});
	it('Test prescence of add event listener', function () {
		expect(boundSensorService.addEventListener).toBeFunction();
	});
	it('Test prescence of remove event listener', function () {
		expect(boundSensorService.removeEventListener).toBeFunction();
	});
	it('Test prescence of configure sensor', function () {
		expect(boundSensorService.configureSensor).toBeFunction();
	});
	it('Test ability to define a sensor',  function () {  
        	expect(boundSensorService.api).toEqual(jasmine.any(String)); 

        	expect(boundSensorService.type).toEqual("http://webinos.org/api/sensors.temperature"); 
        	expect(boundSensorService.maximumRange).toEqual(jasmine.any(Number));
		expect(boundSensorService.maximumRange).toBeGreaterThan(0);  	
        	expect(boundSensorService.minDelay).toEqual(jasmine.any(Number));
		expect(boundSensorService.mindDelay).toBeGreaterThan(0);  	
        	expect(boundSensorService.power).toEqual(jasmine.any(Number));
		expect(boundSensorService.power).toBeGreaterThan(0);  	  
        	expect(boundSensorService.resolution).toEqual(jasmine.any(Number));
		expect(boundSensorService.resolution).toBeGreaterThan(0);  	 
        	expect(boundSensorService.resolution).toEqual(jasmine.any(string)); // Do we have a list of valid vendors? If not we need to check that we don't have an empty or garbage value for vendor.  	
        	expect(boundSensorService.version).toEqual(jasmine.any(Number)); // What format does version number take? Is there a standard?
		expect(boundSensorService.version).toBeGreaterThan(0);
  	  });

	it('Test ability to process events (changes in input) correctly',  function () {  
//Create event here
        	expect(boundSensorService.api).toEqual(event.sensorType); 
  	  }); 
	//Test that Id is set
        	expect(event.sensorId).toBeDefined(); 
  	 //Test that accuracy is set and makes sense
		expect(event.accuracy).toEqual(jasmine.any(Number)); 
		// Will accuracy always be positive?
  	//Test that rate is set and make sense
		expect(event.rate).toEqual(jasmine.any(Number)); 
		expect(event.rate).toBeGreaterThan(0); 
  	//Test that interrupt is set'
		expect(event.rate).toBeDefined(); // What format so interrupt have?
  	//Test that reading took place
		expect(event.sensorValues[0]).toBeDefined(); 
  	 //Test that we can detect an increase
		var initial = event.sensorValues[0]; 
		alert('Please create an increase in sensor value'); 
        	expect(event.sensorValues[0]).toBeGreaterThan(initial); 
  	//Test that we can detect a decrease
		var initial = event.sensorValues[0]; 
		alert('Please create a decrease in sensor value'); 
        	expect(event.sensorValues[0]).toBeLessThan(initial); 
  	 //Test that we don\'t get random changes
		var previous = event.sensorValues[0];
		// var variance = previous/1000; // How sensitive are the different sensors? Perhaps this needs to look at the resolution?
		// while (var count < 10) {
			// setTimeout(function(){
				// expect(event.sensorValues[0]).toBeCloseTo(previous, variance);
				// previous = event.sensorValues[0];
			// },3000);
		// }
  	
});
