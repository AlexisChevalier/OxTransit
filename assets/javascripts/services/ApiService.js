var extensions = require("../utils/Extensions"),
    HttpClient = require("./http/HttpClient");

function ApiService(apiUrl) {
    this.apiUrl = apiUrl;

    this.httpClient = new HttpClient(this.apiUrl);
}

ApiService.prototype.getStations = function(callback) {
    this.httpClient.doGet("stations", callback);
};

ApiService.prototype.getStationsRealTimeData = function(atcoCode, callback) {
    this.httpClient.doGet(extensions.formatString("stations/{0}/nextbuses", atcoCode), callback);
};

module.exports = ApiService;