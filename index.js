/*jshint esversion: 6,node: true,-W041: false */
// weather.js - APIs for openweathermap.org
(function(){

  const http = require('http');
  class OpenWeatherMap {
    constructor(_config) {
      if (_config) this.config = Object.assign({}, _config);
      else this.config = {
        city : 'Fairplay',
        units : 'metric',
        lan : 'en',
        format : 'json',
        APPID : null
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
      return OpenWeatherMap.getData(this.buildPath()).then(json => json.main.temp);
    }

    getPressure() {
      return OpenWeatherMap.getData(this.buildPath()).then(json => json.main.pressure);
    }

    getHumidity() {
      return OpenWeatherMap.getData(this.buildPath()).then(json => json.main.humidity);
    }

    getDescription() {
      return OpenWeatherMap.getData(this.buildPath()).then(json => (json.weather)[0].description);
    }

    getAllWeather() {
      return OpenWeatherMap.getData(this.buildPath());
    }

    getWeatherForecast() {
      return OpenWeatherMap.getData(this.buildPathForecast());
    }

    getWeatherForecastForDays(days) {
      return OpenWeatherMap.getData(this.buildPathForecastForDays(days));
    }

    getWeatherForecastForHours(hours) {
      return OpenWeatherMap.getData(this.buildPathForecastForHours(hours));
    }

    getSmartJSON() {
      return OpenWeatherMap.getData(this.buildPath()).then(json => {
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

    getErr() {

    }

    getCoordinateQuery() {
      var coordinateAvailable = this.config.latitude && this.config.longitude;
      var cityIdAvailable = this.config.cityId;
      var coordinateQuery = 'q='+this.config.city;
      if (cityIdAvailable) coordinateQuery = 'id='+this.config.cityId;
      if (this.config.zip) coordinateQuery = 'zip='+this.config.zip;
      else if (coordinateAvailable) coordinateQuery = 'lat='+this.config.latitude+'&lon='+this.config.longitude;
      return coordinateQuery;
    }

    buildPath() {
      return '/data/2.5/weather?' + this.getCoordinateQuery() + '&units=' + this.config.units + '&lang=' + this.config.lan + '&mode=json&APPID=' + this.config.APPID;
    }

    buildPathForecast() { 
      return '/data/2.5/forecast?' + this.getCoordinateQuery() + '&units=' + this.config.units + '&lang=' + this.config.lan + '&mode=json&APPID=' + this.config.APPID;
    }

    buildPathForecastForDays(days) {
      return '/data/2.5/forecast/daily?' + this.getCoordinateQuery() + '&cnt=' + days + '&units=' + this.config.units + '&lang=' + this.config.lan + '&mode=json&APPID=' + this.config.APPID;
    }

    buildPathForecastForHours(hours) {
      return '/data/2.5/forecast/hour?' + this.getCoordinateQuery() + '&cnt=' + hours + '&units=' + this.config.units + '&lang=' + this.config.lan + '&mode=json&APPID=' + this.config.APPID;
    }

    static getData(url, tries = 3) {
      return new Promise((resolve, reject) => {
        var options = {
          host : 'api.openweathermap.org',
          path: url,
          withCredentials: false
        };
        var conn = http.get(options, function(res) {
          var chunks = '';
          res.on('data', chunk => { chunks += chunk; });
          res.on('end', () => {
            var parsed = {};

            if (!chunks && (!tries || tries < 3)) {
              resolve(OpenWeatherMap.getData(url, (tries||0)+1));
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
