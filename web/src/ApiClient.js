var extensions = require("./utils/Extensions"),
    HttpClient = require("./http/HttpClient");

function ApiClient(apiUrl) {
    this.apiUrl = apiUrl;

    this.httpClient = new HttpClient(this.apiUrl);
}

ApiClient.prototype.getStations = function(callback) {
    this.httpClient.doGet("stops", callback);
};

ApiClient.prototype.getStationsRealTimeData = function(naptanCode, callback) {
    this.httpClient.doGet(extensions.formatString("realtime/{0}", naptanCode), callback);
};

module.exports = ApiClient;