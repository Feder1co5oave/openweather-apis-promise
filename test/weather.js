// test use cases - weather.js APIs
var chai = require('chai');
var expect = require('chai').expect;
var OpenWeatherMap = require('../index.js');
var weather = new OpenWeatherMap();

var myAPPID = '2a1ad423e9fad1a3ceda81fda56b1366';

describe('OpenWeatherMap ', function(){

	describe('Settings :', function(){

		it('Should set the APPID ', function(){
			var _weather = weather.setAPPID(myAPPID);
			chai.assert.equal(myAPPID, _weather.getAPPID());
			weather = _weather;
		});

		it('Should set the language to Italia (it) ', function(){
			var _weather = weather.setLang('it');
			chai.assert.equal('it', _weather.getLang().toLowerCase());
			weather = _weather;
		});

		it('Should set the units to metric  ', function(){
			var _weather = weather.setUnits('metric');
			chai.assert.equal('metric', _weather.getUnits().toLowerCase());
			weather = _weather;
		});

		it('Should set the City to Fairplay ', function(){
			var _weather = weather.setCity('Fairplay');
			chai.assert.equal('fairplay', _weather.getCity().toLowerCase());
			weather = _weather;
		});

		it('Should set the coordinate to 50.0467656, 20.0048731', function(){
			var _weather = weather.setCoordinate(50.0467656, 20.0048731);
			var coordinates = _weather.getCoordinate();
			expect(coordinates).be.not.empty;
			expect(coordinates.latitude).be.equal(50.0467656);
			expect(coordinates.longitude).be.equal(20.0048731);
			weather = _weather;
		});

		it('Should set the City ID to 4367872', function(){
			var _weather = weather.setCityId(4367872);
			var cityid = _weather.getCityId();
			expect(cityid).be.not.empty;
			expect(cityid).be.equal(4367872);
			weather = _weather;
		});
	});

	describe('Retrive data : ', function(){
		it('Should retrive temperature data ', function(done){
			weather.getTemperature().then(temp => {
				chai.assert.typeOf(temp, 'number');
				done();
			});
		});
		it('Should retrive pressure data ', function(done){
			weather.getPressure().then(pres => {
				chai.assert.typeOf(pres, 'number');
				done();
			});
		});
		it('Should retrive humidity data ', function(done){
			weather.getHumidity().then(hum => {
				chai.assert.typeOf(hum, 'number');
				done();
			});
		});
		it('Should retrive brief description of the weather ', function(done){
			weather.getDescription().then(desc => {
				chai.assert.typeOf(desc, 'string');
				done();
			});
		});

		it('Should present all the JSON Weather response data ', function(done){
			weather.getAllWeather().then(jsonObj => {
				chai.assert.property(jsonObj , 'weather');
				done();
			});
		});

		it('Should present the rain in mm of last hour if present ', function(done) {
			weather.getSmartJSON().then(jsonObj => {
				if(jsonObj.rain){
					chai.assert.typeOf(jsonObj.rain['3h'], 'number');
				}
				if(jsonObj.precipitation){
					chai.assert.typeOf(jsonObj.precipitation.value, 'number');
				}

				if(!(jsonObj.rain || jsonObj.precipitation)) {
					chai.assert.equal(jsonObj.rain, 0);
				}
				
				done();
			});
		});

		it('Should present short-term weather forecast', function(done){
			weather.getWeatherForecast().then(obj => {
				expect(obj).not.empty;
                expect(obj.cnt).is.equal(40);
				expect(obj.list).is.not.empty;
				done();
			});
		});
		it('Should present 3 day weather forecast', function(done){
			weather.getWeatherForecastForDays(3).then(obj => {
				expect(obj).not.empty;
				expect(obj.cnt).is.equal(3);
				expect(obj.list).is.not.empty;
				expect(obj.list.length).is.equal(3);
				done();
			});
		});

		it('Should return a smart JSON weather object ', function(done){
			weather.getSmartJSON().then(smart => {
				chai.assert.property(smart, 'temp');
				chai.assert.property(smart, 'humidity');
				chai.assert.property(smart, 'pressure');
				chai.assert.property(smart, 'description');
				done();
			});
		});
	});

	describe('Error managment section', function(){
		it('Should show a HTTP error in the request ', function(){
			weather.getError().catch(err => {
				chai.assert.typeOf(err, 'error');
			});
		});
	});

});
