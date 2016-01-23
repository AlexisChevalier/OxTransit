var $ = require('jquery-browserify'),
    ApiClient = require("./ApiClient");

function NextBusesDetails(rootDomElement) {
    this.apiClient = new ApiClient("/api/");
    this.rootDomElement = $(rootDomElement);
    this.stationTextElement = $(this.rootDomElement).find(".text");
    this.stationRefreshElement = $(this.rootDomElement).find(".refresh");
    this.listElement = $(this.rootDomElement).find(".content");
    this.stationSelected = null;
    
    this.refreshing = false;
    
    var _this = this;
    
    $(this.stationRefreshElement).click(function() {
        _this.refreshSelectedStation();
    });
}

function buildListItem(details) {
    return "<li class='result'><span class='time'>" + details.departureTime + "</span><span class='bus'>" + details.serviceNumber + "</span> - <span class='destination'>" + details.destination + "</span></li>";
}

NextBusesDetails.prototype.setSelectedStation = function(station, details) {
    var _this = this;
    
    $(_this.listElement).html("");
    
    if (station === null) {
        this.stationSelected = null;
        this.rootDomElement.addClass("noselection");
        this.stationTextElement.text("No station selected");
    } else {
        this.stationSelected = station;
        this.rootDomElement.removeClass("noselection");
        this.stationTextElement.text(station.name + " (" + station.indicator + ")");
        $(_this.stationRefreshElement).addClass("fa-spin");
        
        this.apiClient.getStationsRealTimeData(this.stationSelected.naptanCode, function (err, details) {
            for (var i = 0; i < details.length; i++) {
                $(_this.listElement).append(buildListItem(details[i]));   
            }
            $(_this.stationRefreshElement).removeClass("fa-spin");
            this.refreshing = false;
        });
    }
};

NextBusesDetails.prototype.refreshSelectedStation = function() {
    
    if (this.refreshing) {
        return;
    }
    
    this.refreshing = true;
    
    var _this = this;
    if (this.stationSelected !== null) {
        var stationAtCall = _this.stationSelected;
        $(_this.stationRefreshElement).addClass("fa-spin");
        
        this.apiClient.getStationsRealTimeData(stationAtCall.naptanCode, function (err, details) {
            if (stationAtCall === _this.stationSelected) {
                $(_this.listElement).html("");
                for (var i = 0; i < details.length; i++) {
                    $(_this.listElement).append(buildListItem(details[i]));
                }
                $(_this.stationRefreshElement).removeClass("fa-spin");
                _this.refreshing = false;
            }
        });
    }
};

module.exports = NextBusesDetails;