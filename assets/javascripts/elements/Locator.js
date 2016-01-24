var $ = require('jquery-browserify');

function Locator(rootDomElement, map) {
    this.rootDomElement = $(rootDomElement);
    this.map = map;
    this.mapObject = map.getGoogleMapsObject();
    this.positionMarker = null;
    
    this.refreshButton = $(this.rootDomElement).find("#geolocalizationButton");
    
    this.localising = false;
    
    var _this = this;
    
    $(this.refreshButton).click(function() {
        _this.Localize();
    });
    
    if (!navigator.geolocation) {
        this.refreshButton.hide();
    } else {
        _this.Localize();
    }
}

Locator.prototype.Localize = function() {
    var _this = this;

    if (this.localising) {
        return;
    }
    
    this.localising = true;
    
    if (_this.positionMarker !== null) {
        _this.positionMarker.setMap(null);
        _this.positionMarker = null;
    }
    
    if (navigator.geolocation) {
        $(_this.rootDomElement).addClass("loading");
        navigator.geolocation.getCurrentPosition(function(pos) {
            var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            
            if (_this.map.getBounds().contains(position)) {
                _this.positionMarker = new google.maps.Marker({
                    position: position,
                    map: _this.mapObject,
                    title: "Your position",
                    zIndex: 100
                });
                
                _this.mapObject.setZoom(17);
                _this.mapObject.setCenter(position);
            } else {
                //TODO: HANDLE CASE IF YOU'RE AWAY FROM OXFORD
            }
            
            _this.localising = false;
            $(_this.rootDomElement).removeClass("loading");
        }, function() {
            $(_this.rootDomElement).removeClass("loading");
            _this.localising = false;
            //handleLocationError(true, infoWindow, map.getCenter());
            //TODO: Handle errors
        });
    } else {
        $(_this.rootDomElement).removeClass("loading");
        _this.localising = false;
        // Browser doesn't support Geolocation
        //handleLocationError(false, infoWindow, map.getCenter());
        //TODO: Handle errors
    }
};

module.exports = Locator;