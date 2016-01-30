var stations = null,
    ApiService = require("../services/ApiService"),
    MessagingService = require("../services/MessagingService");

function StationsService() {
    var _this = this;

    this.apiService = new ApiService("/api/");
}

StationsService.prototype.getStations = function(callback) {
    var _this = this;

    if (stations === null) {
        this.apiService.getStations(function(err, result) {
            stations = result.stations;
            return callback(err, result);
        });
    } else {
        return callback(null, stations);
    }
};

StationsService.prototype.getStation = function(atcoCode) {
    var _this = this;

    console.log(atcoCode, stations);
    if (!stations || !stations[atcoCode]) {
        return null;
    }

    return stations[atcoCode];
};

module.exports = StationsService;