/*jshint esversion: 6,node: true,-W041: false */
// weather.js - APIs for openweathermap.org
(function(){

  const http = require('http');
  const https = require('https');
  const querystring = require('querystring');
  const query = querystring.stringify
  class OpenWeatherMap {
    constructor(_config) {
      if (_config) this.config = Object.assign({}, _config);
      else this.config = {
        city : 'Fairplay',
        units : 'metric',
        lan : 'en',
        format : 'json',
        APPID : null,
        ssl: false
      };
    }

    setLang(lang) {
      var r = new OpenWeatherMap(this.config);
      r.config.lan = lang.toLowerCase();
      return r;
    };

    setCity(city){
      var r = new OpenWeatherMap(this.config);
      r.config.city = encodeURIComponent(city.toLowerCase());
      return r;
    };

    setCoordinate(latitude, longitude){
      var r = new OpenWeatherMap(this.config);
      r.config.latitude = latitude;
      r.config.longitude = longitude;
      return r;
    };

    setCityId(cityid){
      var r = new OpenWeatherMap(this.config);
      r.config.cityId = cityid;
      return r;
    };

    setZipCode(zip){
      var r = new OpenWeatherMap(this.config);
      r.config.zip = zip;
      return r;
    };

    setUnits(units){
      var r = new OpenWeatherMap(this.config);
      r.config.units = units.toLowerCase();
      return r;
    };

    setAPPID(appid){
      var r = new OpenWeatherMap(this.config);
      r.config.APPID = appid;
      return r;
    };

    setSsl(ssl){
      var r = new OpenWeatherMap(this.config);
      r.config.ssl = ssl;
      return r;
    }

    // OpenWeatherMap.prototype(get)  ---------------------------------------------  OpenWeatherMap.prototype(get)  ---------------------------------------------
    getLang() {
      return this.config.lan;
    };

    getCity() {
      return this.config.city;
    };

    getCoordinate() {
      return {
        "latitude": this.config.latitude,
        "longitude": this.config.longitude
      };
    };

    getCityId() {
      return this.config.cityId;
    };

    getZipCode() {
      return this.config.zip;
    };

    getUnits() {
      return this.config.units;
    };

    getFormat() {
      return this.config.format;
    };

    getAPPID() {
      return this.config.APPID;
    };

    getSsl() {
      return this.config.ssl;
    };

    getError() {
      return new Promise((resolve, reject) => {
        const options = {
          host : 'api.openweathermap.org',
          path: 'timetocrash',
          withCredentials: false
        };
        http.get(options, function(err,data){
          reject(err, data);
        });
      });
    };

    getTemperature() {
      return this.getData(this.buildPath()).then(json => json.main.temp);
    }

    getPressure() {
      return this.getData(this.buildPath()).then(json => json.main.pressure);
    }

    getHumidity() {
      return this.getData(this.buildPath()).then(json => json.main.humidity);
    }

    getDescription() {
      return this.getData(this.buildPath()).then(json => (json.weather)[0].description);
    }

    getAllWeather() {
      return this.getData(this.buildPath());
    }

    getWeatherForecast() {
      return this.getData(this.buildPathForecast());
    }

    getWeatherForecastForDays(days) {
      return this.getData(this.buildPathForecastForDays(days));
    }

    getWeatherForecastForHours(hours) {
      return this.getData(this.buildPathForecastForHours(hours));
    }

    getSmartJSON() {
      return this.getData(this.buildPath()).then(json => {
        var smart = {
          temp: json.main.temp,
          humidity: json.main.humidity,
          pressure: json.main.pressure,
          description: (json.weather[0]).description,
          weathercode: (json.weather[0]).id
        };

        if (json.precipitation) smart.rain = json.precipitation.value;
        else smart.rain = 0;

        if (json.rain) {
          var rain3h = json.rain;
          smart.rain = Math.round(rain3h['3h'] / 3);
        }
        return smart;
      });
    }

    // active functions()  -------------------------------------  active functions()  --------------------------------------------

    getHttp() {
      return this.config.ssl ? https : http;
    }

    getErr() {

    }

    getCoordinateQuery() {
      var gpsAvailable = this.config.latitude && this.config.longitude;
      var coordinateQuery = {
        units: this.config.units,
        lang: this.config.lan,
        mode: 'json',
        APPID: this.config.APPID
      };
      if (this.config.city) coordinateQuery.q = this.config.city;
      else if (this.config.cityId) coordinateQuery.id = this.config.cityId;
      else if (this.config.zip) coordinateQuery.zip = this.config.zip;
      else if (gpsAvailable) {
        coordinateQuery.lat = this.config.latitude;
        coordinateQuery.lon = this.config.longitude;
      }
      return coordinateQuery;
    }

    buildPath() {
      return '/data/2.5/weather?' + query(this.getCoordinateQuery());
    }

    buildPathForecast() { 
      return '/data/2.5/forecast?' + query(this.getCoordinateQuery());
    }

    buildPathForecastForDays(days) {
      let q = this.getCoordinateQuery();
      q.cnt = days;
      return '/data/2.5/forecast/daily?' + query(q);
    }

    buildPathForecastForHours(hours) {
      let q = this.getCoordinateQuery();
      q.cnt = hours;
      return '/data/2.5/forecast/hour?' + query(q);
    }

    getData(url, tries = 3) {
      return new Promise((resolve, reject) => {
        var options = {
          host : 'api.openweathermap.org',
          path: url,
          withCredentials: false
        };
        var conn = this.getHttp().get(options, function(res) {
          var chunks = '';
          res.on('data', chunk => { chunks += chunk; });
          res.on('end', () => {
            var parsed = {};

            if (!chunks && (!tries || tries < 3)) {
              resolve(this.getData(url, (tries||0)+1));
            }
            // Try-Catch added by Mikael Aspehed
            try {
              parsed = JSON.parse(chunks);
              resolve(parsed);
            } catch (e) {
              parsed = { error: e };
              reject(parsed);
            }
          });

          res.on('error', function(err) {
            reject(err);
          });
        });

        conn.on('error', function(err) {
          reject(err);
        });
      });
    }
  }

  module.exports = OpenWeatherMap;
})();
