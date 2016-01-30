var $ = require('jquery-browserify'),
    ApiService = require("../services/ApiService"),
    moment = require("moment");

function NextBusesDetails(rootDomElement) {
    this.apiService = new ApiService("/api/");
    this.rootDomElement = $(rootDomElement);
    this.stationTextElement = $(this.rootDomElement).find(".text");
    this.infoMessageElement = $(this.rootDomElement).find(".message");
    this.infoMessageElementText = $(this.infoMessageElement).find("p");
    this.stationRefreshElement = $(this.rootDomElement).find(".refresh");
    this.listElement = $(this.rootDomElement).find(".content");
    this.stationSelected = null;
    this.refreshDelayMiliseconds = 30000;
    this.refreshTimeoutId = null;
    this.refreshing = false;
    
    var _this = this;
    
    /*$(this.stationRefreshElement).click(function() {
        _this.refreshSelectedStation();
    });*/
    
    this.fetchAndDisplayList = function (callback) {
        var _this = this;

        if (this.stationSelected !== null) {
            var stationAtCall = _this.stationSelected;
            _this.stationRefreshElement.show();

            this.apiService.getStationsRealTimeData(stationAtCall.atcoCode, function (err, details) {
                if (stationAtCall === _this.stationSelected) {
                    $(_this.listElement).html("");

                    if (details && details.length > 0) {
                        _this.infoMessageElement.hide();
                        for (var i = 0; i < details.length; i++) {
                            $(_this.listElement).append(buildListItem(details[i]));
                        }
                    } else {
                        _this.infoMessageElementText.text("Not any information available for this station at the moment");
                        _this.infoMessageElement.show();
                    }

                    _this.stationRefreshElement.hide();
                    _this.refreshing = false;

                    if (typeof callback === "function") {
                        return callback(null, true);
                    }
                } else {
                    if (typeof callback === "function") {
                        return callback(null, false);
                    }
                }
            });
        }
    };

    this.startRefreshTimeout = function () {
        this.refreshTimeoutId = window.setTimeout(function () {
            _this.refreshSelectedStation(function(err, result) {
                _this.startRefreshTimeout();
            });
        }, this.refreshDelayMiliseconds);
    };

    this.removeRefreshTimeout = function () {
        if (this.refreshTimeoutId) {
            window.clearTimeout(this.refreshTimeoutId);
        }
    };
}

function buildListItem(details) {
    return "<li class='result'><span class='time'>" + moment(details.arrivalTime).format('H:mm') + "</span><span class='bus'>" + details.line + "</span> - <span class='destination'>" + details.destination + "</span></li>";
}

NextBusesDetails.prototype.setSelectedStation = function(station, details) {
    var _this = this;
    
    $(_this.listElement).html("");
    
    if (station === null) {
        _this.removeRefreshTimeout();
        this.stationSelected = null;
        this.rootDomElement.addClass("noselection");
        this.stationTextElement.text("No station selected");
        this.infoMessageElementText.text("Please select a station on the map");
        this.infoMessageElement.show();

    } else {
        this.stationSelected = station;
        this.rootDomElement.removeClass("noselection");
        this.stationTextElement.text(station.name + " (" + station.indicator + ")");
        this.infoMessageElementText.text("Loading next buses...");
        this.infoMessageElement.show();
        this.fetchAndDisplayList(function() {
            _this.startRefreshTimeout();
        });

    }
};

NextBusesDetails.prototype.refreshSelectedStation = function(callback) {
    
    if (this.refreshing) {
        if (typeof callback === "function") {
            return callback(null, false);
        } else {
            return false;
        }
    }
    
    this.refreshing = true;
    
    this.fetchAndDisplayList(callback);
};

module.exports = NextBusesDetails;