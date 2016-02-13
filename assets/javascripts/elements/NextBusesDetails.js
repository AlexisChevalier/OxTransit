var $ = require('jquery-browserify'),
    ApiService = require("../services/ApiService"),
    moment = require("moment"),
    StationsService = require("../services/StationsService"),
    MessagingService = require("../services/MessagingService");

function NextBusesDetails(rootDomElement) {
    this.apiService = new ApiService("/api/");
    this.rootDomElement = $(rootDomElement);
    this.stationTextElement = $(this.rootDomElement).find(".text");
    this.infoMessageElement = $(this.rootDomElement).find(".message");
    this.infoMessageElementText = $(this.infoMessageElement).find("p");
    this.stationRefreshElement = $(this.rootDomElement).find(".refresh");
    this.listElement = $(this.rootDomElement).find(".content");
    this.stationsService = new StationsService();
    this.stationSelected = null;
    this.refreshDelayMiliseconds = 30000;
    this.refreshTimeoutId = null;
    this.refreshing = false;
    
    var _this = this;
    
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

                        $(_this.listElement).html(buildList(details));

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
        _this.removeRefreshTimeout();
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

    MessagingService.messaging.subscribe(MessagingService.actions.StationSelected, function(msg, data) {
        var atcoCode = data.atcoCode;

        var station = _this.stationsService.getStation(atcoCode);

        _this.setSelectedStation(station);
    });
}

function getDisplayedTime(time) {
    var now = Date.now();

    var minutesFromNow = Math.round((time - now) / 60000);

    if (minutesFromNow <= 1 && minutesFromNow > -2) {
        return "DUE";
    } else if (minutesFromNow <= -2) {
        return "DELAYED";
    }

    return moment(time).fromNow(false);
}

function buildListItem(details) {
    return "<li class='result'>" +
        "<span class='time'>" +
        getDisplayedTime(details.arrivalTime) +
        "</span><span class='bus'>" + details.line +
        "</span></li>";
}

function buildListSeparator(destination) {
    return "<li class='separator'>" +
        "<span class='destination'>" +
        "TO " + destination +
        "</span></li>";
}

function buildList(nextBuses) {
    var html = "";

    nextBuses.sort(function (a, b) {
        if(a.destination < b.destination) return -1;
        if(a.destination > b.destination) return 1;
        if(a.arrivalTime < b.arrivalTime) return -1;
        if(a.arrivalTime > b.arrivalTime) return 1;
        return 0;
    });

    var currentDestination = null;
    var currentDestinationCount = 0;
    for (var i = 0; i < nextBuses.length; i++) {
        if (nextBuses[i].destination !== currentDestination) {
            currentDestination = nextBuses[i].destination;
            currentDestinationCount = 0;
            html += buildListSeparator(currentDestination);
        }

        if (currentDestinationCount <= 2) {
            html += buildListItem(nextBuses[i]);
        }
        currentDestinationCount++;
    }

    return html;
}

NextBusesDetails.prototype.setSelectedStation = function(station) {
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